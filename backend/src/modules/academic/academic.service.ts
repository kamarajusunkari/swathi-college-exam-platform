import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  CreateClassDto,
  BulkClassDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  MapSubjectClassesDto,
  AssignTeacherDto,
} from "./dto/academic.dto";

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  async getHierarchy() {
    const [academicYears, classes, subjects] = await Promise.all([
      this.prisma.academicYear.findMany({
        include: { students: true, exams: true },
        orderBy: { startDate: "desc" },
      }),
      this.prisma.class.findMany({
        include: { sections: true, groups: true, subjects: true, students: true },
        orderBy: { name: "asc" },
      }),
      this.prisma.subject.findMany({
        include: {
          class: true,
          assignments: {
            include: {
              teacher: { include: { user: true } },
              section: true,
            },
          },
          exams: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      academicYears,
      years: academicYears,
      classes,
      subjects,
    };
  }

  async createClass(dto: CreateClassDto) {
    const { name, code, sectionName = "Section A" } = dto;
    const formattedCode = code.toUpperCase();

    const existing = await this.prisma.class.findUnique({
      where: { code: formattedCode },
    });
    if (existing) {
      throw new ConflictException(`Class code "${formattedCode}" already exists.`);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const cls = await tx.class.create({
        data: {
          name,
          code: formattedCode,
        },
      });

      await tx.section.create({
        data: {
          name: sectionName,
          classId: cls.id,
        },
      });

      return cls;
    });

    return {
      success: true,
      message: "Academic class and initial section created successfully",
      class: created,
    };
  }

  async bulkCreateClasses(dto: BulkClassDto) {
    const { classes } = dto;
    let createdCount = 0;

    for (const item of classes) {
      const existing = await this.prisma.class.findUnique({
        where: { code: item.code.toUpperCase() },
      });

      if (!existing) {
        const cls = await this.prisma.class.create({
          data: {
            name: item.name,
            code: item.code.toUpperCase(),
          },
        });

        await this.prisma.section.create({
          data: {
            name: item.section || "Section A",
            classId: cls.id,
          },
        });
        createdCount++;
      }
    }

    return {
      success: true,
      message: `Successfully imported ${createdCount} new academic classes`,
      totalProcessed: classes.length,
    };
  }

  async getSubjects(classId?: string) {
    const whereClause: any = {};
    if (classId && classId !== "ALL") {
      whereClause.classId = classId;
    }

    const subjects = await this.prisma.subject.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            sections: true,
            _count: {
              select: { students: true },
            },
          },
        },
        assignments: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
            section: true,
          },
        },
        exams: {
          select: {
            id: true,
            title: true,
            examCode: true,
            releaseStatus: true,
          },
        },
      },
      orderBy: [{ class: { name: "asc" } }, { code: "asc" }],
    });

    return { success: true, subjects };
  }

  async createSubject(dto: CreateSubjectDto, userId?: string) {
    const {
      name,
      code,
      classId,
      classIds,
      maxMarks = 100,
      passMarks = 35,
      credits = 4,
      teacherId,
      sectionId,
    } = dto;

    const formattedCode = code.trim().toUpperCase();

    let targetClassIds: string[] = [];
    if (Array.isArray(classIds) && classIds.length > 0) {
      targetClassIds = classIds.filter(Boolean);
    } else if (classId) {
      targetClassIds = [classId];
    }

    if (targetClassIds.length === 0) {
      throw new BadRequestException("Please select at least one Target Academic Class.");
    }

    const targetClasses = await this.prisma.class.findMany({
      where: { id: { in: targetClassIds } },
    });

    if (targetClasses.length === 0) {
      throw new NotFoundException("Selected Academic Classes were not found.");
    }

    const currentYear = await this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    const createdSubjects: any[] = [];
    const skippedClasses: string[] = [];

    for (const cls of targetClasses) {
      const existingInClass = await this.prisma.subject.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          classId: cls.id,
        },
      });

      if (existingInClass) {
        skippedClasses.push(`${cls.name} (Already has "${existingInClass.name}")`);
        continue;
      }

      let finalCode = formattedCode;
      const codeTaken = await this.prisma.subject.findUnique({
        where: { code: finalCode },
      });

      if (codeTaken) {
        const cleanClsCode = cls.code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        finalCode = `${formattedCode}-${cleanClsCode}`;
        const stillTaken = await this.prisma.subject.findUnique({
          where: { code: finalCode },
        });
        if (stillTaken) {
          finalCode = `${formattedCode}-${cleanClsCode}-${Date.now().toString().slice(-3)}`;
        }
      }

      const subject = await this.prisma.subject.create({
        data: {
          name: name.trim(),
          code: finalCode,
          classId: cls.id,
          maxMarks: Number(maxMarks),
          passMarks: Number(passMarks),
          credits: Number(credits),
        },
        include: {
          class: true,
        },
      });

      createdSubjects.push(subject);

      if (teacherId && currentYear) {
        try {
          await this.prisma.teacherAssignment.create({
            data: {
              teacherId,
              academicYearId: currentYear.id,
              classId: cls.id,
              sectionId: sectionId || null,
              subjectId: subject.id,
            },
          });
        } catch (assignErr) {
          console.warn(`Could not assign teacher for class ${cls.name}:`, assignErr);
        }
      }
    }

    if (createdSubjects.length === 0) {
      throw new BadRequestException(`Subject was not created. ${skippedClasses.join(", ")}`);
    }

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "SUBJECT_MULTI_CLASS_CREATED",
            entity: "Subject",
            entityId: createdSubjects[0].id,
            details: JSON.stringify({
              name: name.trim(),
              baseCode: formattedCode,
              mappedClasses: createdSubjects.map((s) => ({
                subjectId: s.id,
                className: s.class.name,
                code: s.code,
              })),
              skipped: skippedClasses,
            }),
          },
        });
      } catch {}
    }

    const classNamesList = createdSubjects.map((s) => s.class.name).join(", ");
    return {
      success: true,
      message: `Subject "${name.trim()}" mapped successfully to ${createdSubjects.length} class${createdSubjects.length > 1 ? "es" : ""}: ${classNamesList}.${skippedClasses.length > 0 ? ` (Skipped: ${skippedClasses.join(", ")})` : ""}`,
      subjects: createdSubjects,
      subject: createdSubjects[0],
    };
  }

  async updateSubject(dto: UpdateSubjectDto, userId?: string) {
    const { id, name, code, classId, maxMarks, passMarks, credits } = dto;
    const formattedCode = code ? code.trim().toUpperCase() : undefined;

    if (code) {
      const duplicate = await this.prisma.subject.findFirst({
        where: {
          code: formattedCode,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Subject Code "${formattedCode}" is already taken by "${duplicate.name}".`);
      }
    }

    const updated = await this.prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(formattedCode && { code: formattedCode }),
        ...(classId && { classId }),
        ...(maxMarks !== undefined && { maxMarks: Number(maxMarks) }),
        ...(passMarks !== undefined && { passMarks: Number(passMarks) }),
        ...(credits !== undefined && { credits: Number(credits) }),
      },
      include: {
        class: true,
      },
    });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "SUBJECT_UPDATED",
            entity: "Subject",
            entityId: updated.id,
            details: JSON.stringify(updated),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `Subject "${updated.name}" successfully updated.`,
      subject: updated,
    };
  }

  async deleteSubject(id: string, userId?: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { exams: true, assignments: true },
    });

    if (!subject) {
      throw new NotFoundException("Subject not found.");
    }

    await this.prisma.teacherAssignment.deleteMany({
      where: { subjectId: id },
    });

    await this.prisma.subject.delete({
      where: { id },
    });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "SUBJECT_DELETED",
            entity: "Subject",
            entityId: id,
            details: JSON.stringify({ name: subject.name, code: subject.code }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `Subject "${subject.name}" (${subject.code}) successfully removed.`,
    };
  }

  async mapSubjectToClasses(dto: MapSubjectClassesDto, userId?: string) {
    const { sourceSubjectId, targetClassIds, copyTeacher = true, perClassTeachers = {} } = dto;

    const sourceSubject = await this.prisma.subject.findUnique({
      where: { id: sourceSubjectId },
      include: {
        class: true,
        assignments: {
          include: { teacher: { include: { user: true } } },
        },
      },
    });

    if (!sourceSubject) {
      throw new NotFoundException("Source subject not found.");
    }

    const targetClasses = await this.prisma.class.findMany({
      where: { id: { in: targetClassIds } },
    });

    if (targetClasses.length === 0) {
      throw new NotFoundException("No valid target classes found.");
    }

    const currentYear = await this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    const primaryTeacherId = sourceSubject.assignments[0]?.teacherId;
    const createdMappings: any[] = [];
    const skippedClasses: string[] = [];

    for (const cls of targetClasses) {
      const existing = await this.prisma.subject.findFirst({
        where: {
          name: { equals: sourceSubject.name, mode: "insensitive" },
          classId: cls.id,
        },
      });

      if (existing) {
        skippedClasses.push(`${cls.name} (Already exists as ${existing.code})`);
        continue;
      }

      const cleanClsCode = cls.code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      let uniqueCode = `${sourceSubject.code}-${cleanClsCode}`;
      const codeTaken = await this.prisma.subject.findUnique({
        where: { code: uniqueCode },
      });
      if (codeTaken) {
        uniqueCode = `${sourceSubject.code}-${cleanClsCode}-${Date.now().toString().slice(-3)}`;
      }

      const newSubject = await this.prisma.subject.create({
        data: {
          name: sourceSubject.name,
          code: uniqueCode,
          classId: cls.id,
          maxMarks: sourceSubject.maxMarks,
          passMarks: sourceSubject.passMarks,
          credits: sourceSubject.credits,
        },
        include: { class: true },
      });

      createdMappings.push(newSubject);

      const selectedTeacherId = perClassTeachers[cls.id] || (copyTeacher ? primaryTeacherId : null);
      if (selectedTeacherId && currentYear) {
        try {
          await this.prisma.teacherAssignment.create({
            data: {
              teacherId: selectedTeacherId,
              academicYearId: currentYear.id,
              classId: cls.id,
              subjectId: newSubject.id,
            },
          });
        } catch {}
      }
    }

    if (createdMappings.length === 0) {
      throw new BadRequestException(`No new class mappings created. ${skippedClasses.join(", ")}`);
    }

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "SUBJECT_MAPPED_TO_CLASSES",
            entity: "Subject",
            entityId: sourceSubject.id,
            details: JSON.stringify({
              sourceSubject: sourceSubject.name,
              createdCount: createdMappings.length,
            }),
          },
        });
      } catch {}
    }

    const mappedNames = createdMappings.map((m) => m.class.name).join(", ");
    return {
      success: true,
      message: `Successfully mapped "${sourceSubject.name}" to ${createdMappings.length} additional class${createdMappings.length > 1 ? "es" : ""}: ${mappedNames}.${skippedClasses.length > 0 ? ` (Skipped: ${skippedClasses.join(", ")})` : ""}`,
      mappedSubjects: createdMappings,
    };
  }

  async assignTeacher(dto: AssignTeacherDto, userId?: string) {
    const { subjectId, teacherId, classId, sectionId } = dto;

    const currentYear = await this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new BadRequestException("Active Academic Year not configured.");
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: { class: true },
    });

    if (!subject) {
      throw new NotFoundException("Subject not found.");
    }

    const targetClassId = classId || subject.classId;

    const existing = await this.prisma.teacherAssignment.findFirst({
      where: {
        teacherId,
        subjectId,
        classId: targetClassId,
        sectionId: sectionId || null,
        academicYearId: currentYear.id,
      },
    });

    if (existing) {
      throw new ConflictException("This faculty member is already assigned to this subject & section.");
    }

    const assignment = await this.prisma.teacherAssignment.create({
      data: {
        teacherId,
        subjectId,
        classId: targetClassId,
        sectionId: sectionId || null,
        academicYearId: currentYear.id,
      },
      include: {
        teacher: { include: { user: true } },
        subject: true,
        class: true,
        section: true,
      },
    });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "TEACHER_ASSIGNED_TO_SUBJECT",
            entity: "TeacherAssignment",
            entityId: assignment.id,
            details: JSON.stringify({
              teacherName: assignment.teacher.user.name,
              subjectName: assignment.subject.name,
            }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `Assigned ${assignment.teacher.user.name} to ${assignment.subject.name} (${assignment.class.name}).`,
      assignment,
    };
  }

  async deleteTeacherAssignment(assignmentId: string) {
    await this.prisma.teacherAssignment.delete({
      where: { id: assignmentId },
    });

    return {
      success: true,
      message: "Faculty teaching assignment unlinked successfully.",
    };
  }

  async deleteEntity(type: string, id: string) {
    if (type === "subject") {
      return this.deleteSubject(id);
    }
    if (type === "section") {
      const section = await this.prisma.section.findUnique({ where: { id } });
      if (!section) throw new NotFoundException("Section not found");
      await this.prisma.section.delete({ where: { id } });
      return { success: true, message: `Section "${section.name}" deleted.` };
    }
    if (type === "class") {
      const cls = await this.prisma.class.findUnique({ where: { id } });
      if (!cls) throw new NotFoundException("Class/Program not found");
      await this.prisma.class.delete({ where: { id } });
      return { success: true, message: `Program "${cls.name}" deleted.` };
    }
    if (type === "year") {
      const yr = await this.prisma.academicYear.findUnique({ where: { id } });
      if (!yr) throw new NotFoundException("Academic Year not found");
      await this.prisma.academicYear.delete({ where: { id } });
      return { success: true, message: `Academic Year "${yr.name}" deleted.` };
    }
    throw new BadRequestException("Invalid academic entity type");
  }
}

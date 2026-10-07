import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import bcrypt from "bcryptjs";
import { OnboardUserDto, BulkOnboardDto, UpdateUserRoleDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        studentProfile: {
          include: {
            class: true,
            section: true,
            academicYear: true,
          },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: users.length, users };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            class: true,
            section: true,
            group: true,
            academicYear: true,
            feePayments: true,
            hallTickets: { include: { exam: true } },
            examResults: { include: { exam: { include: { subject: true } } } },
          },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true, academicYear: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return { success: true, user };
  }

  async onboardUser(dto: OnboardUserDto, adminId?: string) {
    const {
      type,
      name,
      email,
      phone,
      password,
      role,
      designation,
      employeeId,
      department,
      qualification,
      rollNo,
      studentId,
      admissionNo,
      classId,
      sectionId,
      academicYearId,
      fatherName,
      gender,
      dob,
    } = dto;

    if (!name || !email) {
      throw new BadRequestException("Name and Email are required.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException("Email already registered.");
    }

    const defaultPassword =
      password ||
      (type === "admin" ? "Admin@123" : type === "teacher" ? "Teacher@123" : "Student@123");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    let newUser: any;

    if (type === "admin") {
      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: role || "ADMIN",
          permissions: JSON.stringify([
            "MANAGE_STUDENTS",
            "MANAGE_EXAMS",
            "UPLOAD_PAPERS",
            "MANAGE_FEES",
            "ISSUE_HALL_TICKETS",
            "MANAGE_ANSWER_SHEETS",
            "PUBLISH_RESULTS",
          ]),
        },
      });
    } else if (type === "teacher") {
      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: "TEACHER",
          teacherProfile: {
            create: {
              employeeId: employeeId || `FAC-${Date.now().toString().slice(-4)}`,
              department: department || "Pharmaceutics",
              designation: designation || "Assistant Professor",
              qualification: qualification || "M.Pharm",
            },
          },
        },
        include: { teacherProfile: true },
      });
    } else {
      const defaultClass = await this.prisma.class.findFirst();
      const defaultSection = await this.prisma.section.findFirst({
        where: { classId: defaultClass?.id },
      });
      const defaultAy = await this.prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });

      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: "STUDENT",
          studentProfile: {
            create: {
              studentId: studentId || `SWC-2026-${Date.now().toString().slice(-4)}`,
              rollNo: rollNo || `${Date.now().toString().slice(-6)}`,
              admissionNo: admissionNo || `ADM-${Date.now().toString().slice(-4)}`,
              fatherName,
              gender: gender || "Male",
              dob,
              classId: classId || defaultClass?.id || "",
              sectionId: sectionId || defaultSection?.id || "",
              academicYearId: academicYearId || defaultAy?.id || "",
            },
          },
        },
        include: { studentProfile: true },
      });
    }

    if (this.prisma.auditLog && adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: "USER_ONBOARDED",
            entity: "User",
            entityId: newUser.id,
            details: JSON.stringify({ role: newUser.role, email: newUser.email, name: newUser.name }),
          },
        });
      } catch {}
    }

    return { success: true, user: newUser };
  }

  async bulkOnboard(dto: BulkOnboardDto) {
    const { type, records } = dto;
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new BadRequestException("No records provided");
    }

    let createdCount = 0;
    const defaultAdminHash = await bcrypt.hash("Admin@123", 10);
    const defaultTeacherHash = await bcrypt.hash("Teacher@123", 10);
    const defaultStudentHash = await bcrypt.hash("Student@123", 10);

    const [academicYears, classes, sections] = await Promise.all([
      this.prisma.academicYear.findMany(),
      this.prisma.class.findMany(),
      this.prisma.section.findMany(),
    ]);

    const defaultAy = academicYears.find((a) => a.isCurrent) || academicYears[0];
    const defaultClass = classes[0];
    const defaultSection = sections[0];

    for (const row of records) {
      const email = row.Email?.trim().toLowerCase();
      const name = row.Name?.trim();
      if (!email || !name) continue;

      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) continue;

      const passwordHash = row.Password
        ? await bcrypt.hash(row.Password.trim(), 10)
        : type === "admin"
        ? defaultAdminHash
        : type === "teacher"
        ? defaultTeacherHash
        : defaultStudentHash;

      if (type === "admin") {
        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: row.Role?.toUpperCase() === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
          },
        });
        createdCount++;
      } else if (type === "teacher") {
        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: "TEACHER",
            teacherProfile: {
              create: {
                employeeId: row.EmployeeId?.trim() || `FAC-${Date.now().toString().slice(-4)}`,
                department: row.Department || "Pharmaceutics",
                designation: row.Designation || "Assistant Professor",
                qualification: row.Qualification || "M.Pharm",
              },
            },
          },
        });
        createdCount++;
      } else {
        const matchedClass =
          classes.find((c) => c.code.toLowerCase() === row.ClassCode?.trim().toLowerCase()) ||
          defaultClass;
        const matchedSection =
          sections.find((s) => s.classId === matchedClass?.id) || defaultSection;

        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: "STUDENT",
            studentProfile: {
              create: {
                studentId: row.StudentId?.trim() || `SWC-2026-${Date.now().toString().slice(-4)}`,
                rollNo: row.RollNo?.trim() || `${Date.now().toString().slice(-6)}`,
                admissionNo: row.AdmissionNo || `ADM-${Date.now().toString().slice(-4)}`,
                fatherName: row.FatherName || null,
                gender: row.Gender || "Male",
                dob: row.DOB || null,
                classId: matchedClass.id,
                sectionId: matchedSection.id,
                academicYearId: defaultAy.id,
              },
            },
          },
        });
        createdCount++;
      }
    }

    return { success: true, count: createdCount };
  }

  async updateRole(dto: UpdateUserRoleDto, adminId?: string) {
    const {
      userId,
      role,
      permissions,
      isActive,
      isTimeRestricted,
      timeWindowStart,
      timeWindowEnd,
      dailyStartTime,
      dailyEndTime,
    } = dto;

    if (!userId) {
      throw new BadRequestException("User ID is required.");
    }

    const permissionsPayload =
      typeof permissions === "string" ? permissions : JSON.stringify(permissions || []);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(permissions !== undefined ? { permissions: permissionsPayload } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isTimeRestricted !== undefined ? { isTimeRestricted } : {}),
        ...(timeWindowStart !== undefined
          ? { timeWindowStart: timeWindowStart ? new Date(timeWindowStart) : null }
          : {}),
        ...(timeWindowEnd !== undefined
          ? { timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd) : null }
          : {}),
        ...(dailyStartTime !== undefined ? { dailyStartTime } : {}),
        ...(dailyEndTime !== undefined ? { dailyEndTime } : {}),
      },
    });

    if (this.prisma.auditLog && adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: "USER_ROLE_PERMISSIONS_UPDATED",
            entity: "User",
            entityId: userId,
            details: JSON.stringify({ updatedRole: role, isTimeRestricted }),
          },
        });
      } catch {}
    }

    return { success: true, user: updatedUser };
  }

  async deleteUser(id: string, currentAdminId: string) {
    if (currentAdminId === id) {
      throw new BadRequestException("Cannot delete your own active administrator account.");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException("User not found.");
    }

    await this.prisma.user.delete({ where: { id } });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: currentAdminId,
            action: "USER_DELETED_BY_ADMIN",
            entity: "User",
            entityId: id,
            details: JSON.stringify({
              deletedUserName: targetUser.name,
              deletedUserEmail: targetUser.email,
              deletedUserRole: targetUser.role,
            }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `User ${targetUser.name} (${targetUser.role}) deleted successfully.`,
    };
  }

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    const [exams, feePayments, results, hallTickets] = await Promise.all([
      this.prisma.examination.findMany({
        where: student ? { classId: student.classId } : {},
        include: { subject: true, class: true },
        orderBy: { examDate: "asc" },
        take: 6,
      }),
      this.prisma.feePayment.findMany({
        where: student ? { studentId: student.id } : {},
        include: { exam: true },
        take: 6,
      }),
      this.prisma.examResult.findMany({
        where: student ? { studentId: student.id, isPublished: true } : {},
        include: { exam: { include: { subject: true } } },
        take: 6,
      }),
      this.prisma.hallTicket.findMany({
        where: student ? { studentId: student.id } : {},
        include: { exam: true },
        take: 6,
      }),
    ]);

    return {
      success: true,
      exams,
      feePayments,
      results,
      hallTickets,
    };
  }

  async getStudentExams(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        class: true,
        section: true,
        academicYear: true,
      },
    });

    if (!student) {
      return { success: false, student: null, exams: [] };
    }

    const exams = await this.prisma.examination.findMany({
      where: { classId: student.classId },
      include: {
        academicYear: true,
        subject: true,
        papers: true,
      },
      orderBy: { examDate: "asc" },
    });

    return { success: true, student, exams };
  }

  async getStudentFees(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        feePayments: {
          include: { exam: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }

  async getStudentHallTickets(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        academicYear: true,
        feePayments: true,
        hallTickets: {
          include: {
            exam: {
              include: { subject: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }

  async getStudentResults(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        academicYear: true,
        examResults: {
          where: { isPublished: true },
          include: {
            exam: {
              include: { subject: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }
}

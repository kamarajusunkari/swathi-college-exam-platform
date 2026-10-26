import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  SubmitEvaluationDto,
  CheckModerationDto,
  OverrideMarksDto,
  IngestAnswerSheetsDto,
  RevaluationRequestDto,
  CreateBundleDto,
} from "./dto/evaluation.dto";

@Injectable()
export class EvaluationService {
  constructor(private prisma: PrismaService) {}

  async getQueue(userId: string, role: string) {
    const isTeacher = role === "TEACHER";

    const answerSheets = await this.prisma.answerSheet.findMany({
      where: isTeacher ? { evaluatedById: userId } : {},
      include: {
        student: {
          include: { user: true, class: true, section: true },
        },
        exam: {
          include: { subject: true, class: true },
        },
        evaluatedBy: { select: { id: true, name: true, email: true } },
        checkedBy: { select: { id: true, name: true } },
        questionEvaluations: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: answerSheets.length, answerSheets, sheets: answerSheets };
  }

  async getQueueOverview() {
    const [exams, answerSheets, allStudents] = await Promise.all([
      this.prisma.examination.findMany({
        include: {
          subject: true,
          class: {
            include: {
              students: {
                include: {
                  user: true,
                  class: true,
                  section: true,
                },
                orderBy: { rollNo: "asc" },
              },
            },
          },
          section: true,
          academicYear: true,
          papers: {
            include: {
              questions: true,
              uploadedBy: { select: { id: true, name: true } },
            },
          },
          answerSheets: {
            include: {
              student: {
                include: {
                  user: true,
                  class: true,
                  section: true,
                },
              },
              questionEvaluations: true,
              evaluatedBy: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { examDate: "desc" },
      }),
      this.prisma.answerSheet.findMany({
        include: {
          student: {
            include: {
              user: true,
              class: true,
              section: true,
            },
          },
          exam: {
            include: {
              subject: true,
              class: true,
            },
          },
          questionEvaluations: true,
          evaluatedBy: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.studentProfile.findMany({
        include: {
          user: true,
          class: true,
          section: true,
        },
        orderBy: { rollNo: "asc" },
      }),
    ]);

    return {
      success: true,
      exams,
      answerSheets,
      allStudents,
    };
  }

  async getCheckerOverview() {
    const [pendingForChecking, finalizedSheets] = await Promise.all([
      this.prisma.answerSheet.findMany({
        where: {
          checkedById: null,
        },
        include: {
          student: {
            include: { user: true, class: true },
          },
          exam: {
            include: { subject: true },
          },
          evaluatedBy: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.answerSheet.findMany({
        where: {
          checkedById: { not: null },
        },
        select: { id: true },
      }),
    ]);

    return {
      success: true,
      pendingForChecking,
      finalizedCount: finalizedSheets.length,
    };
  }

  async getEvaluatorOverview(userId: string, role: string) {
    const isTeacher = role === "TEACHER";
    const [pendingAnswerSheets, evaluatedSheetsCount] = await Promise.all([
      this.prisma.answerSheet.findMany({
        where: {
          evaluationStatus: { in: ["PENDING", "AI_EVALUATED", "UNDER_REVIEW"] },
          ...(isTeacher ? { evaluatedById: userId } : {}),
        },
        include: {
          exam: {
            include: {
              subject: true,
              class: true,
            },
          },
          student: {
            include: {
              user: true,
              class: true,
              section: true,
            },
          },
          pages: true,
          questionEvaluations: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.answerSheet.count({
        where: {
          evaluationStatus: "FINALIZED",
          ...(isTeacher ? { evaluatedById: userId } : {}),
        },
      }),
    ]);

    return {
      success: true,
      pendingAnswerSheets,
      evaluatedSheetsCount,
    };
  }

  async getAnswerSheetById(id: string) {
    const sheet = await this.prisma.answerSheet.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: true, class: true, section: true },
        },
        exam: {
          include: {
            subject: true,
            class: true,
            papers: {
              include: {
                questions: { orderBy: { questionNumber: "asc" } },
              },
            },
          },
        },
        pages: { orderBy: { pageNumber: "asc" } },
        questionEvaluations: { orderBy: { questionNumber: "asc" } },
        evaluatedBy: { select: { id: true, name: true, email: true } },
        checkedBy: { select: { id: true, name: true } },
      },
    });

    if (!sheet) {
      throw new NotFoundException("Answer sheet not found");
    }

    return { success: true, sheet };
  }

  async submitEvaluation(dto: SubmitEvaluationDto, userId: string) {
    const { answerSheetId, evaluations } = dto;

    const sheet = await this.prisma.answerSheet.findUnique({
      where: { id: answerSheetId },
      include: {
        student: { include: { user: true } },
        exam: { include: { subject: true } },
      },
    });

    if (!sheet) {
      throw new NotFoundException("Answer sheet not found");
    }

    let totalMarks = 0;
    for (const item of evaluations) {
      totalMarks += Number(item.marksAwarded) || 0;
    }

    const maxMarks = sheet.exam.maxMarks || 100;
    const percentage = (totalMarks / maxMarks) * 100;
    let grade = "F";
    let isPassed = false;
    if (percentage >= 90) { grade = "O"; isPassed = true; }
    else if (percentage >= 80) { grade = "A+"; isPassed = true; }
    else if (percentage >= 70) { grade = "A"; isPassed = true; }
    else if (percentage >= 60) { grade = "B+"; isPassed = true; }
    else if (percentage >= 50) { grade = "B"; isPassed = true; }
    else if (percentage >= 40) { grade = "C"; isPassed = true; }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of evaluations) {
        await tx.questionEvaluation.upsert({
          where: {
            answerSheetId_questionNumber: {
              answerSheetId: sheet.id,
              questionNumber: item.questionNumber,
            },
          },
          create: {
            answerSheetId: sheet.id,
            questionNumber: item.questionNumber,
            maxMarks: item.maxMarks || 10,
            teacherMarks: item.marksAwarded,
            teacherComment: item.remarks || null,
          },
          update: {
            teacherMarks: item.marksAwarded,
            teacherComment: item.remarks || null,
          },
        });
      }

      return await tx.answerSheet.update({
        where: { id: sheet.id },
        data: {
          evaluationStatus: dto.isDraft ? "UNDER_REVIEW" : "FINALIZED",
          teacherTotalScore: totalMarks,
          finalScore: totalMarks,
          percentage,
          grade,
          evaluatedById: userId,
          verifiedAt: new Date(),
          finalizedAt: dto.isDraft ? null : new Date(),
        },
      });
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "EVALUATION_FINALIZED",
            entity: "AnswerSheet",
            entityId: sheet.id,
            details: JSON.stringify({ sheetCode: sheet.sheetCode, totalMarks, grade }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: "Evaluation finalized successfully",
      obtainedMarks: totalMarks,
      totalMarksScored: totalMarks,
      grade,
      isPassed,
      sheet: updated,
    };
  }

  async checkModeration(dto: CheckModerationDto, userId: string, userName: string) {
    const { answerSheetId, adjustedScore, checkerNotes, questionAdjustments } = dto;

    const sheet = await this.prisma.answerSheet.findUnique({
      where: { id: answerSheetId },
      include: {
        student: { include: { user: true } },
        exam: { include: { subject: true, academicYear: true } },
        questionEvaluations: true,
      },
    });

    if (!sheet) {
      throw new NotFoundException("Answer sheet not found");
    }

    const finalMarks = Number(
      adjustedScore !== undefined && adjustedScore !== null
        ? adjustedScore
        : sheet.finalScore || sheet.teacherTotalScore || 0
    );

    const maxMarks = sheet.exam.maxMarks || 100;
    const percentage = (finalMarks / maxMarks) * 100;

    let grade = "F";
    let gradePoint = 0.0;
    let isPassed = false;

    if (percentage >= 90) { grade = "O"; gradePoint = 10.0; isPassed = true; }
    else if (percentage >= 80) { grade = "A+"; gradePoint = 9.0; isPassed = true; }
    else if (percentage >= 70) { grade = "A"; gradePoint = 8.0; isPassed = true; }
    else if (percentage >= 60) { grade = "B+"; gradePoint = 7.0; isPassed = true; }
    else if (percentage >= 50) { grade = "B"; gradePoint = 6.0; isPassed = true; }
    else if (percentage >= 40) { grade = "C"; gradePoint = 5.0; isPassed = true; }

    await this.prisma.$transaction(async (tx) => {
      if (Array.isArray(questionAdjustments)) {
        for (const adj of questionAdjustments) {
          await tx.questionEvaluation.updateMany({
            where: {
              answerSheetId,
              questionNumber: Number(adj.questionNumber),
            },
            data: {
              teacherMarks: Number(adj.adjustedMarks),
              teacherComment: adj.remarks || undefined,
            },
          });
        }
      }

      await tx.answerSheet.update({
        where: { id: answerSheetId },
        data: {
          evaluationStatus: "FINALIZED",
          finalScore: finalMarks,
          percentage,
          grade,
          checkedById: userId,
          checkedAt: new Date(),
          checkerNotes: checkerNotes || "2nd-stage scrutiny verified & approved by Paper Checker.",
          finalizedAt: new Date(),
        },
      });

      if (sheet.studentId) {
        await tx.examResult.upsert({
          where: {
            studentId_examId: {
              studentId: sheet.studentId,
              examId: sheet.examId,
            },
          },
          create: {
            studentId: sheet.studentId,
            examId: sheet.examId,
            academicYearId: sheet.exam.academicYearId,
            totalMarksObtained: finalMarks,
            maxMarksTotal: sheet.exam.maxMarks,
            percentage,
            gpa: gradePoint,
            grade,
            resultStatus: isPassed ? "PASS" : "FAIL",
            isPublished: false,
          },
          update: {
            totalMarksObtained: finalMarks,
            maxMarksTotal: sheet.exam.maxMarks,
            percentage,
            gpa: gradePoint,
            grade,
            resultStatus: isPassed ? "PASS" : "FAIL",
            updatedAt: new Date(),
          },
        });
      }

      if (this.prisma.auditLog) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "PAPER_CHECKING_AND_MODERATION_COMPLETED",
            entity: "AnswerSheet",
            entityId: answerSheetId,
            details: JSON.stringify({
              sheetCode: sheet.sheetCode,
              studentRollNo: sheet.student?.rollNo,
              subject: sheet.exam.subject.name,
              verifiedFinalMarks: finalMarks,
              grade,
              checker: userName,
              checkerNotes,
            }),
          },
        });
      }
    });

    return {
      success: true,
      message: `Answer booklet ${sheet.sheetCode} successfully verified & signed off!`,
      finalMarks,
      grade,
      isPassed,
    };
  }

  async overrideMarks(id: string, dto: OverrideMarksDto, userId: string) {
    const { finalScore, grade, remarks } = dto;

    const sheet = await this.prisma.answerSheet.findUnique({
      where: { id },
      include: { exam: true, student: true },
    });

    if (!sheet) {
      throw new NotFoundException("Answer sheet not found");
    }

    const updated = await this.prisma.answerSheet.update({
      where: { id },
      data: {
        ...(finalScore !== undefined && { finalScore }),
        ...(grade && { grade }),
        evaluationStatus: "FINALIZED",
        finalizedAt: new Date(),
      },
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "MARKS_OVERRIDDEN",
            entity: "AnswerSheet",
            entityId: id,
            details: JSON.stringify({ finalScore, grade, remarks, sheetCode: sheet.sheetCode }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: "Marks overridden successfully",
      sheet: updated,
    };
  }

  async ingestSheets(dto: IngestAnswerSheetsDto, userId: string) {
    const { examId, sheets } = dto;

    const createdSheets: any[] = [];
    for (const item of sheets) {
      const sheetCode = item.sheetCode || `ANS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      let studentId = item.studentId;
      if (!studentId && item.rollNo) {
        const student = await this.prisma.studentProfile.findFirst({
          where: { rollNo: item.rollNo },
        });
        if (student) studentId = student.id;
      }

      const created = await this.prisma.answerSheet.upsert({
        where: { sheetCode },
        create: {
          examId,
          studentId: studentId || null,
          sheetCode,
          totalPages: item.totalPages || 4,
          evaluationStatus: "PENDING",
          aiTotalScore: item.aiTotalScore ?? null,
          finalScore: item.finalScore ?? null,
        },
        update: {
          examId,
          studentId: studentId || null,
          totalPages: item.totalPages || 4,
          ...(item.aiTotalScore !== undefined && { aiTotalScore: item.aiTotalScore }),
          ...(item.finalScore !== undefined && { finalScore: item.finalScore }),
        },
        include: {
          student: { include: { user: true, class: true } },
          exam: { include: { subject: true } },
        },
      });
      createdSheets.push(created);
    }

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "ANSWER_SHEETS_INGESTED",
            entity: "AnswerSheet",
            entityId: examId,
            details: JSON.stringify({ count: createdSheets.length, examId }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `Successfully ingested ${createdSheets.length} answer sheets.`,
      sheets: createdSheets,
    };
  }

  async deleteAnswerSheet(id: string, userId?: string) {
    const sheet = await this.prisma.answerSheet.findUnique({ where: { id } });
    if (!sheet) throw new NotFoundException("Answer sheet not found");

    await this.prisma.questionEvaluation.deleteMany({ where: { answerSheetId: id } });
    await this.prisma.answerSheetPage.deleteMany({ where: { answerSheetId: id } });
    await this.prisma.answerSheet.delete({ where: { id } });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "ANSWER_SHEET_DELETED",
            entity: "AnswerSheet",
            entityId: id,
            details: JSON.stringify({ sheetCode: sheet.sheetCode }),
          },
        });
      } catch {}
    }

    return { success: true, message: `Answer sheet "${sheet.sheetCode}" deleted successfully.` };
  }

  async getBundles() {
    const bundles = await this.prisma.answerSheetBundle.findMany({
      include: {
        exam: {
          include: { subject: true, class: true },
        },
        uploadedBy: { select: { id: true, name: true, email: true } },
        answerSheets: {
          include: { student: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: bundles.length, bundles };
  }

  async revaluationRequest(dto: RevaluationRequestDto, userId: string) {
    const { answerSheetId, reason } = dto;

    const sheet = await this.prisma.answerSheet.findFirst({
      where: {
        OR: [
          { id: answerSheetId },
          { student: { rollNo: answerSheetId } },
          { student: { userId } },
        ],
      },
    });

    if (!sheet) {
      throw new NotFoundException("Answer sheet not found");
    }

    const updated = await this.prisma.answerSheet.update({
      where: { id: sheet.id },
      data: { evaluationStatus: "UNDER_REVIEW" },
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "REVALUATION_REQUESTED",
            entity: "AnswerSheet",
            entityId: answerSheetId,
            details: JSON.stringify({ reason }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: "Revaluation request submitted to Examination Cell.",
      sheet: updated,
    };
  }

  async createBundle(dto: CreateBundleDto, userId: string) {
    let examId = dto.examId;
    if (!examId) {
      const activeExam = await this.prisma.examination.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (activeExam) examId = activeExam.id;
    }

    if (!examId) {
      throw new NotFoundException("No examination found to link bundle to.");
    }

    const bundleCode = dto.bundleCode || `BDL-SWC-${Date.now().toString().slice(-4)}`;

    const bundle = await this.prisma.answerSheetBundle.create({
      data: {
        examId,
        bundleCode,
        totalSheets: dto.totalSheets || 30,
        scanStatus: dto.scanStatus || "COMPLETED",
        uploadedById: userId,
      },
      include: {
        exam: { include: { subject: true, class: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "BUNDLE_INGESTED",
            entity: "AnswerSheetBundle",
            entityId: bundle.id,
            details: JSON.stringify({ bundleCode, totalSheets: bundle.totalSheets }),
          },
        });
      } catch {}
    }

    return { success: true, message: `Bundle ${bundleCode} successfully ingested.`, bundle };
  }

  async deleteBundle(id: string, userId?: string) {
    const bundle = await this.prisma.answerSheetBundle.findUnique({ where: { id } });
    if (!bundle) throw new NotFoundException("Bundle not found");

    await this.prisma.answerSheet.updateMany({
      where: { bundleId: id },
      data: { bundleId: null },
    });

    await this.prisma.answerSheetBundle.delete({ where: { id } });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "BUNDLE_DELETED",
            entity: "AnswerSheetBundle",
            entityId: id,
            details: JSON.stringify({ bundleCode: bundle.bundleCode }),
          },
        });
      } catch {}
    }

    return { success: true, message: `Bundle "${bundle.bundleCode}" deleted successfully.` };
  }
}

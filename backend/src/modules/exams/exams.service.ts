import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateExamDto, TogglePaperReleaseDto } from "./dto/exam.dto";

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async getExams(classId?: string) {
    const exams = await this.prisma.examination.findMany({
      where: classId && classId !== "ALL" ? { classId } : {},
      include: {
        academicYear: true,
        class: {
          include: { sections: true },
        },
        subject: true,
        papers: {
          include: {
            uploadedBy: { select: { id: true, name: true, email: true } },
            approvedBy: { select: { id: true, name: true, email: true } },
            questions: { orderBy: { questionNumber: "asc" } },
          },
        },
        feePayments: true,
        hallTickets: true,
        _count: {
          select: { answerSheets: true, feePayments: true, examResults: true },
        },
      },
      orderBy: { examDate: "asc" },
    });

    return { success: true, count: exams.length, exams };
  }

  async getExamById(id: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id },
      include: {
        academicYear: true,
        class: {
          include: { sections: true, groups: true },
        },
        subject: true,
        papers: {
          include: {
            questions: { orderBy: { questionNumber: "asc" } },
            uploadedBy: { select: { id: true, name: true, email: true } },
            approvedBy: { select: { id: true, name: true, email: true } },
          },
        },
        feePayments: true,
        hallTickets: true,
        answerSheets: {
          include: {
            student: true,
            questionEvaluations: true,
          },
        },
        examResults: true,
      },
    });

    if (!exam) {
      throw new NotFoundException("Examination not found");
    }

    return { success: true, exam };
  }

  async createExam(dto: CreateExamDto, userId: string) {
    const {
      title,
      subjectId,
      classId,
      academicYearId,
      examDate,
      startTime = "10:00",
      endTime = "13:00",
      durationMinutes = 180,
      maxMarks = 100,
      passMarks = 35,
      examType = "MID_TERM",
      examFee = 250,
      releaseLeadMinutes = 120,
      questions = [],
    } = dto;

    let finalAcademicYearId = academicYearId;
    if (!finalAcademicYearId) {
      const currentYear = await this.prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });
      finalAcademicYearId = currentYear?.id || (await this.prisma.academicYear.findFirst())?.id;
    }
    if (!finalAcademicYearId) {
      throw new BadRequestException("No academic year configured in system");
    }

    let finalSubjectId = subjectId;
    if (!finalSubjectId) {
      const subject = await this.prisma.subject.findFirst({
        where: classId ? { classId } : {},
      });
      finalSubjectId = subject?.id || (await this.prisma.subject.findFirst())?.id;
    }
    if (!finalSubjectId) {
      throw new BadRequestException("No subject found for this class");
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const examCode = `EXAM-${title.slice(0, 4).replace(/[^A-Z0-9]/gi, "").toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const exam = await tx.examination.create({
        data: {
          examCode,
          title,
          subjectId: finalSubjectId!,
          classId,
          academicYearId: finalAcademicYearId!,
          examDate: new Date(examDate),
          startTime,
          endTime,
          durationMinutes,
          maxMarks,
          passMarks,
          examType,
          examFee,
          releaseLeadMinutes,
          status: "UPCOMING",
          releaseStatus: "SCHEDULED",
        },
      });

      const paper = await tx.examPaper.create({
        data: {
          title: `${title} - Official Question Paper`,
          examId: exam.id,
          uploadedById: userId,
          status: "DRAFT",
          isReleased: false,
        },
      });

      for (const q of questions) {
        await tx.questionItem.create({
          data: {
            examPaperId: paper.id,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            maxScore: q.maxScore,
            modelAnswer: q.modelAnswer || null,
            sectionName: q.section || "Section A",
            rubricGuide: q.rubricGuide || null,
          },
        });
      }

      return exam;
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "EXAM_SCHEDULED",
            entity: "Examination",
            entityId: created.id,
            details: JSON.stringify({ title, examCode: created.examCode, examDate }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: "Examination scheduled and blueprint created successfully",
      exam: created,
    };
  }

  async deleteExam(id: string, userId?: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException("Examination not found");
    }

    await this.prisma.examination.delete({
      where: { id },
    });

    if (userId && this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "EXAM_DELETED",
            entity: "Examination",
            entityId: id,
            details: JSON.stringify({ title: exam.title, examCode: exam.examCode }),
          },
        });
      } catch {}
    }

    return { success: true, message: `Exam "${exam.title}" deleted successfully.` };
  }

  async getPaperVault() {
    const papers = await this.prisma.examPaper.findMany({
      include: {
        exam: {
          include: { subject: true, class: true, academicYear: true },
        },
        uploadedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        questions: { orderBy: { questionNumber: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: papers.length, papers };
  }

  async togglePaperRelease(dto: TogglePaperReleaseDto, userId: string) {
    const { paperId, examId, release = true } = dto;

    let targetPaperId = paperId;
    if (!targetPaperId && examId) {
      const paper = await this.prisma.examPaper.findFirst({
        where: { examId },
      });
      if (paper) targetPaperId = paper.id;
    }

    if (!targetPaperId) {
      throw new BadRequestException("Missing paperId or examId");
    }

    const targetStatus = release ? "RELEASED" : "APPROVED";

    const updated = await this.prisma.$transaction(async (tx) => {
      const paper = await tx.examPaper.update({
        where: { id: targetPaperId },
        data: {
          status: targetStatus,
          isReleased: release,
          approvedById: userId,
        },
      });

      await tx.examination.update({
        where: { id: paper.examId },
        data: {
          status: release ? "ACTIVE" : "UPCOMING",
          releaseStatus: release ? "RELEASED" : "SCHEDULED",
          releasedAt: release ? new Date() : null,
        },
      });

      return paper;
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: release ? "PAPER_RELEASED" : "PAPER_LOCKED",
            entity: "ExamPaper",
            entityId: targetPaperId,
            details: JSON.stringify({ isReleased: release, paperTitle: updated.title }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: release
        ? "Paper released successfully to examination centers"
        : "Paper locked back into secure vault",
      paper: updated,
    };
  }

  async submitPaper(paperId: string, userId: string) {
    const paper = await this.prisma.examPaper.findUnique({ where: { id: paperId } });
    if (!paper) throw new NotFoundException("Paper not found");

    const updated = await this.prisma.examPaper.update({
      where: { id: paperId },
      data: { status: "SUBMITTED" },
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "QUESTION_PAPER_SUBMITTED",
            entity: "ExamPaper",
            entityId: paperId,
            details: JSON.stringify({ title: paper.title, status: "SUBMITTED" }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `Question paper "${paper.title}" submitted for Exam Controller sign-off.`,
      paper: updated,
    };
  }

  async updateExam(id: string, body: any, userId: string) {
    const exam = await this.prisma.examination.findUnique({
      where: { id },
      include: { papers: { include: { questions: true } } },
    });
    if (!exam) throw new NotFoundException("Examination not found");

    const {
      title,
      durationMinutes,
      passMarks,
      instructions,
      maxMarks,
      questions = [],
    } = body;

    const updated = await this.prisma.$transaction(async (tx) => {
      const ex = await tx.examination.update({
        where: { id },
        data: {
          title: title || exam.title,
          durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : exam.durationMinutes,
          passMarks: passMarks !== undefined ? Number(passMarks) : exam.passMarks,
          instructions: instructions !== undefined ? instructions : exam.instructions,
          maxMarks: maxMarks !== undefined ? Number(maxMarks) : exam.maxMarks,
        },
      });

      let paper = exam.papers[0];
      if (paper) {
        await tx.examPaper.update({
          where: { id: paper.id },
          data: {
            title: title ? `${title} — Question Blueprint` : paper.title,
          },
        });

        if (questions && questions.length > 0) {
          await tx.questionItem.deleteMany({
            where: { examPaperId: paper.id },
          });

          await tx.questionItem.createMany({
            data: questions.map((q: any, idx: number) => ({
              examPaperId: paper.id,
              questionNumber: q.questionNumber || idx + 1,
              sectionName: q.sectionName || "Section A",
              questionText: q.text || q.questionText || `Question ${idx + 1}`,
              maxScore: Number(q.maxMarks || q.maxScore || 1),
              rubricGuide: q.markingBreakdown ? JSON.stringify(q.markingBreakdown) : q.rubricGuide || null,
              modelAnswer: q.modelAnswer || null,
            })),
          });
        }
      }

      return ex;
    });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "EXAM_UPDATED",
            entity: "Examination",
            entityId: id,
            details: JSON.stringify({ title: updated.title }),
          },
        });
      } catch {}
    }

    const fullExam = await this.getExamById(id);
    return {
      success: true,
      message: "Exam blueprint updated successfully",
      exam: fullExam.exam,
    };
  }
}


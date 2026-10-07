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

    const created = await this.prisma.$transaction(async (tx) => {
      const examCode = `EXAM-${title.slice(0, 4).replace(/[^A-Z0-9]/gi, "").toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const exam = await tx.examination.create({
        data: {
          examCode,
          title,
          subjectId,
          classId,
          academicYearId,
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
}

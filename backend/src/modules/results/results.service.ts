import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PublishResultsDto } from "./dto/result.dto";

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async getResults(userId: string, role: string, studentProfileId?: string) {
    const isStudent = role === "STUDENT";

    const results = await this.prisma.examResult.findMany({
      where: isStudent
        ? {
            studentId: studentProfileId,
            isPublished: true,
          }
        : {},
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: true,
            section: true,
          },
        },
        exam: {
          include: { subject: true, academicYear: true },
        },
        publishedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: results.length, results };
  }

  async publishResults(dto: PublishResultsDto, userId: string, userName: string) {
    const { examId, publish = true } = dto;

    // IDEMPOTENCY GUARD: Check if results are already in requested publish state
    const pendingChanges = await this.prisma.examResult.count({
      where: { examId, isPublished: !publish },
    });
    const totalResults = await this.prisma.examResult.count({ where: { examId } });

    if (totalResults > 0 && pendingChanges === 0) {
      return {
        success: true,
        message: publish
          ? `All ${totalResults} examination results are already published.`
          : `All results for this examination are already held and unpublished.`,
        count: totalResults,
        isIdempotentReplay: true,
      };
    }

    const updateResult = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.examResult.updateMany({
        where: { examId },
        data: {
          isPublished: publish,
          publishedById: publish ? userId : null,
          publishedAt: publish ? new Date() : null,
        },
      });

      if (this.prisma.auditLog) {
        await tx.auditLog.create({
          data: {
            userId,
            action: publish ? "EXAM_RESULTS_PUBLISHED" : "EXAM_RESULTS_UNPUBLISHED",
            entity: "Examination",
            entityId: examId,
            details: JSON.stringify({
              count: updated.count,
              publisher: userName,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }

      return updated;
    });

    return {
      success: true,
      message: publish
        ? `Successfully published ${updateResult.count} subject results to student grade cards.`
        : "Results unpublished and held for moderation.",
      count: updateResult.count,
    };
  }
}

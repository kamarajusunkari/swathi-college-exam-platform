import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PayFeeDto } from "./dto/fee.dto";

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async getFees(userId: string, role: string, studentProfileId?: string) {
    const isStudent = role === "STUDENT";

    const fees = await this.prisma.feePayment.findMany({
      where: isStudent && studentProfileId ? { studentId: studentProfileId } : {},
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
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: fees.length, fees };
  }

  async getFeeById(id: string) {
    const fee = await this.prisma.feePayment.findUnique({
      where: { id },
      include: {
        student: { include: { user: true, class: true } },
        exam: { include: { subject: true, academicYear: true } },
      },
    });

    if (!fee) throw new NotFoundException("Fee record not found");
    return { success: true, fee };
  }

  async payFee(dto: PayFeeDto, userId: string, role: string) {
    const { paymentId, paymentMethod = "UPI_ONLINE" } = dto;

    const fee = await this.prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: {
        student: { include: { user: true } },
        exam: { include: { academicYear: true, subject: true } },
      },
    });

    if (!fee) {
      throw new NotFoundException("Payment invoice not found");
    }

    if (role === "STUDENT" && fee.student.userId !== userId) {
      throw new ForbiddenException("Cannot pay another student's fee");
    }

    const receiptNo = `SWC-REC-${Date.now().toString().slice(-6)}`;
    const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.feePayment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentMethod,
          receiptNo,
          transactionId,
        },
      });

      const ticketNumber = `HT-${fee.exam.examCode}-${fee.student.rollNo}`;
      await tx.hallTicket.upsert({
        where: {
          studentId_examId: {
            studentId: fee.studentId,
            examId: fee.examId,
          },
        },
        create: {
          studentId: fee.studentId,
          examId: fee.examId,
          academicYearId: fee.exam.academicYearId,
          hallTicketNumber: ticketNumber,
          qrCodeData: JSON.stringify({
            ticket: ticketNumber,
            rollNo: fee.student.rollNo,
            student: fee.student.user.name,
            exam: fee.exam.title,
            verified: true,
          }),
          status: "ACTIVE",
        },
        update: {
          status: "ACTIVE",
        },
      });

      if (this.prisma.auditLog) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "FEE_PAID_ONLINE",
            entity: "FeePayment",
            entityId: paymentId,
            details: JSON.stringify({
              receiptNo,
              amount: fee.amount,
              method: paymentMethod,
              studentRollNo: fee.student.rollNo,
            }),
          },
        });
      }
    });

    return {
      success: true,
      message: "Fee payment processed successfully. Hall ticket unlocked.",
      receiptNo,
      transactionId,
    };
  }
}

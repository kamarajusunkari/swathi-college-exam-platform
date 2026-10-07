import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class HallTicketsService {
  constructor(private prisma: PrismaService) {}

  async getHallTickets(userId: string, role: string, studentProfileId?: string) {
    const isStudent = role === "STUDENT";

    const hallTickets = await this.prisma.hallTicket.findMany({
      where: isStudent && studentProfileId ? { studentId: studentProfileId } : {},
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: true,
            section: true,
            feePayments: true,
          },
        },
        exam: {
          include: {
            subject: true,
            papers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, count: hallTickets.length, hallTickets };
  }

  async verifyTicket(ticketNumber: string) {
    const ticket = await this.prisma.hallTicket.findUnique({
      where: { hallTicketNumber: ticketNumber },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            class: true,
          },
        },
        exam: {
          include: { subject: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Hall ticket not found in registry");
    }

    return {
      valid: ticket.status === "ACTIVE",
      ticketNumber: ticket.hallTicketNumber,
      candidate: ticket.student.user.name,
      rollNo: ticket.student.rollNo,
      class: ticket.student.class.name,
      exam: ticket.exam.title,
      center: ticket.centerName,
      status: ticket.status,
    };
  }
}

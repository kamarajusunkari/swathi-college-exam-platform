import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { HallTicketsService } from "./hall-tickets.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("hall-tickets")
@UseGuards(JwtAuthGuard)
export class HallTicketsController {
  constructor(private hallTicketsService: HallTicketsService) {}

  @Get()
  getHallTickets(
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("studentProfileId") studentProfileId?: string
  ) {
    return this.hallTicketsService.getHallTickets(userId, role, studentProfileId);
  }

  @Public()
  @Get("verify/:ticketNumber")
  verifyTicket(@Param("ticketNumber") ticketNumber: string) {
    return this.hallTicketsService.verifyTicket(ticketNumber);
  }
}

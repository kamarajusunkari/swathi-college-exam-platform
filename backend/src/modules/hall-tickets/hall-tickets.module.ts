import { Module } from "@nestjs/common";
import { HallTicketsController } from "./hall-tickets.controller";
import { HallTicketsService } from "./hall-tickets.service";

@Module({
  controllers: [HallTicketsController],
  providers: [HallTicketsService],
  exports: [HallTicketsService],
})
export class HallTicketsModule {}

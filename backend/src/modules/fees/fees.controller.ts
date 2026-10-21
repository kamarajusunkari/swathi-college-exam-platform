import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { FeesService } from "./fees.service";
import { PayFeeDto } from "./dto/fee.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("fees")
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private feesService: FeesService) {}

  @Get()
  getFees(
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("studentProfileId") studentProfileId?: string
  ) {
    return this.feesService.getFees(userId, role, studentProfileId);
  }

  @Get(":id")
  getFeeById(@Param("id") id: string) {
    return this.feesService.getFeeById(id);
  }

  @Post("pay")
  payFee(
    @Body() dto: PayFeeDto,
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string
  ) {
    return this.feesService.payFee(dto, userId, role);
  }

  @Delete(":id")
  deleteFee(@Param("id") id: string) {
    return this.feesService.deleteFee(id);
  }
}

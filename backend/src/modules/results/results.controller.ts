import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ResultsService } from "./results.service";
import { PublishResultsDto } from "./dto/result.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("results")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  @Get()
  getResults(
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string,
    @CurrentUser("studentProfileId") studentProfileId?: string
  ) {
    return this.resultsService.getResults(userId, role, studentProfileId);
  }

  @Post("publish")
  @Roles("SUPER_ADMIN", "ADMIN")
  publishResults(
    @Body() dto: PublishResultsDto,
    @CurrentUser("id") userId: string,
    @CurrentUser("name") userName: string
  ) {
    return this.resultsService.publishResults(dto, userId, userName);
  }
}

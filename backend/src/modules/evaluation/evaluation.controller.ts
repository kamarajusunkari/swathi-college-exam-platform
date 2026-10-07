import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EvaluationService } from "./evaluation.service";
import {
  SubmitEvaluationDto,
  CheckModerationDto,
  OverrideMarksDto,
  IngestAnswerSheetsDto,
  RevaluationRequestDto,
} from "./dto/evaluation.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("evaluation")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationController {
  constructor(private evaluationService: EvaluationService) {}

  @Get("queue")
  getQueue(@CurrentUser("id") userId: string, @CurrentUser("role") role: string) {
    return this.evaluationService.getQueue(userId, role);
  }

  @Get("queue/overview")
  getQueueOverview() {
    return this.evaluationService.getQueueOverview();
  }

  @Get("checker/overview")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CHECKER")
  getCheckerOverview() {
    return this.evaluationService.getCheckerOverview();
  }

  @Get("evaluator/overview")
  @Roles("SUPER_ADMIN", "ADMIN", "TEACHER", "EXAM_PAPER_EVALUATOR")
  getEvaluatorOverview(
    @CurrentUser("id") userId: string,
    @CurrentUser("role") role: string
  ) {
    return this.evaluationService.getEvaluatorOverview(userId, role);
  }

  @Get("bundles/all")
  getBundles() {
    return this.evaluationService.getBundles();
  }

  @Get(":id")
  getAnswerSheetById(@Param("id") id: string) {
    return this.evaluationService.getAnswerSheetById(id);
  }

  @Post("submit")
  @Roles("SUPER_ADMIN", "ADMIN", "TEACHER", "EXAM_PAPER_EVALUATOR")
  submitEvaluation(
    @Body() dto: SubmitEvaluationDto,
    @CurrentUser("id") userId: string
  ) {
    return this.evaluationService.submitEvaluation(dto, userId);
  }

  @Post("check")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CHECKER")
  checkModeration(
    @Body() dto: CheckModerationDto,
    @CurrentUser("id") userId: string,
    @CurrentUser("name") userName: string
  ) {
    return this.evaluationService.checkModeration(dto, userId, userName);
  }

  @Post("revaluation")
  revaluationRequest(
    @Body() dto: RevaluationRequestDto,
    @CurrentUser("id") userId: string
  ) {
    return this.evaluationService.revaluationRequest(dto, userId);
  }

  @Post(":id/override")
  @Roles("SUPER_ADMIN", "ADMIN")
  overrideMarks(
    @Param("id") id: string,
    @Body() dto: OverrideMarksDto,
    @CurrentUser("id") userId: string
  ) {
    return this.evaluationService.overrideMarks(id, { ...dto, answerSheetId: id }, userId);
  }

  @Post("sheets")
  @Roles("SUPER_ADMIN", "ADMIN", "TEACHER")
  ingestSheets(
    @Body() dto: IngestAnswerSheetsDto,
    @CurrentUser("id") userId: string
  ) {
    return this.evaluationService.ingestSheets(dto, userId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteAnswerSheet(@Param("id") id: string, @CurrentUser("id") userId?: string) {
    return this.evaluationService.deleteAnswerSheet(id, userId);
  }
}

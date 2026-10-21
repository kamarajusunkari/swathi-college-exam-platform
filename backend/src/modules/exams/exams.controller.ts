import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ExamsService } from "./exams.service";
import { CreateExamDto, TogglePaperReleaseDto } from "./dto/exam.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("exams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Get()
  getExams(@Query("classId") classId?: string) {
    return this.examsService.getExams(classId);
  }

  @Get("papers/vault")
  getPaperVault() {
    return this.examsService.getPaperVault();
  }

  @Get(":id")
  getExamById(@Param("id") id: string) {
    return this.examsService.getExamById(id);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  createExam(
    @Body() dto: CreateExamDto,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.createExam(dto, userId);
  }

  @Post("create")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  createExamAlias(
    @Body() dto: CreateExamDto,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.createExam(dto, userId);
  }

  @Post("papers/submit")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  submitPaper(
    @Body() body: { paperId: string },
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.submitPaper(body.paperId, userId);
  }

  @Post("papers/:id/submit")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  submitPaperParam(
    @Param("id") id: string,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.submitPaper(id, userId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  updateExamPut(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.updateExam(id, body, userId);
  }

  @Post(":id/update")
  @Roles("SUPER_ADMIN", "ADMIN", "EXAM_PAPER_CREATOR", "TEACHER")
  updateExamPost(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.updateExam(id, body, userId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteExam(@Param("id") id: string, @CurrentUser("id") userId?: string) {
    return this.examsService.deleteExam(id, userId);
  }

  @Post("papers/release")
  @Roles("SUPER_ADMIN", "ADMIN")
  togglePaperRelease(
    @Body() dto: TogglePaperReleaseDto,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.togglePaperRelease(dto, userId);
  }

  @Post("release")
  @Roles("SUPER_ADMIN", "ADMIN")
  toggleReleaseAlias(
    @Body() dto: TogglePaperReleaseDto,
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.togglePaperRelease(dto, userId);
  }

  @Post(":id/release")
  @Roles("SUPER_ADMIN", "ADMIN")
  toggleReleaseParam(
    @Param("id") id: string,
    @Body() body: { release?: boolean },
    @CurrentUser("id") userId: string
  ) {
    return this.examsService.togglePaperRelease(
      { examId: id, release: body.release !== false },
      userId
    );
  }
}

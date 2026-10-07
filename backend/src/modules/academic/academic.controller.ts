import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AcademicService } from "./academic.service";
import {
  CreateClassDto,
  BulkClassDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  MapSubjectClassesDto,
  AssignTeacherDto,
} from "./dto/academic.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("academic")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicController {
  constructor(private academicService: AcademicService) {}

  @Get()
  getHierarchy() {
    return this.academicService.getHierarchy();
  }

  @Get("hierarchy")
  getHierarchyAlias() {
    return this.academicService.getHierarchy();
  }

  @Post("classes")
  @Roles("SUPER_ADMIN", "ADMIN")
  createClass(@Body() dto: CreateClassDto) {
    return this.academicService.createClass(dto);
  }

  @Post("classes/bulk")
  @Roles("SUPER_ADMIN", "ADMIN")
  bulkCreateClasses(@Body() dto: BulkClassDto) {
    return this.academicService.bulkCreateClasses(dto);
  }

  @Get("subjects")
  getSubjects(@Query("classId") classId?: string) {
    return this.academicService.getSubjects(classId);
  }

  @Post("subjects")
  @Roles("SUPER_ADMIN", "ADMIN")
  createSubject(@Body() dto: CreateSubjectDto, @CurrentUser("id") userId?: string) {
    return this.academicService.createSubject(dto, userId);
  }

  @Put("subjects")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateSubject(@Body() dto: UpdateSubjectDto, @CurrentUser("id") userId?: string) {
    return this.academicService.updateSubject(dto, userId);
  }

  @Delete("subjects")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteSubject(@Query("id") id: string, @CurrentUser("id") userId?: string) {
    return this.academicService.deleteSubject(id, userId);
  }

  @Post("subjects/map-classes")
  @Roles("SUPER_ADMIN", "ADMIN")
  mapSubjectToClasses(
    @Body() dto: MapSubjectClassesDto,
    @CurrentUser("id") userId?: string
  ) {
    return this.academicService.mapSubjectToClasses(dto, userId);
  }

  @Post("subjects/assign-teacher")
  @Roles("SUPER_ADMIN", "ADMIN")
  assignTeacher(@Body() dto: AssignTeacherDto, @CurrentUser("id") userId?: string) {
    return this.academicService.assignTeacher(dto, userId);
  }

  @Delete("subjects/assign-teacher")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteTeacherAssignment(@Query("id") id: string) {
    return this.academicService.deleteTeacherAssignment(id);
  }

  @Post("delete")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteEntity(@Body() body: { type: string; id: string }) {
    return this.academicService.deleteEntity(body.type, body.id);
  }
}

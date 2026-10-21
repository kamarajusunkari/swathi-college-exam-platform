import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
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
  @Post("programs")
  @Roles("SUPER_ADMIN", "ADMIN")
  createProgram(@Body() dto: { name: string; code: string; description?: string; duration?: number }) {
    return this.academicService.createProgram(dto);
  }

  @Put("programs/:id")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateProgram(
    @Param("id") id: string,
    @Body() dto: { name?: string; code?: string; description?: string; duration?: number }
  ) {
    return this.academicService.updateProgram(id, dto);
  }

  @Post("classes")
  @Roles("SUPER_ADMIN", "ADMIN")
  createClass(@Body() dto: CreateClassDto) {
    return this.academicService.createClass(dto);
  }

  @Put("classes/:id")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateClass(@Param("id") id: string, @Body() dto: { name?: string; code?: string }) {
    return this.academicService.updateClass(id, dto);
  }

  @Post("sections")
  @Roles("SUPER_ADMIN", "ADMIN")
  createSection(@Body() dto: { name: string; classId: string }) {
    return this.academicService.createSection(dto);
  }

  @Put("sections/:id")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateSection(@Param("id") id: string, @Body() dto: { name?: string }) {
    return this.academicService.updateSection(id, dto);
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

  @Post("subjects/update")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateSubjectAlias(@Body() dto: UpdateSubjectDto, @CurrentUser("id") userId?: string) {
    return this.academicService.updateSubject(dto, userId);
  }

  @Delete("subjects")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteSubject(@Query("id") id: string, @CurrentUser("id") userId?: string) {
    return this.academicService.deleteSubject(id, userId);
  }

  @Delete("subjects/:id")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteSubjectById(@Param("id") id: string, @CurrentUser("id") userId?: string) {
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

  @Delete("delete")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteEntityDelete(@Query("type") type: string, @Query("id") id: string, @Body() body?: { type?: string; id?: string }) {
    const finalType = type || body?.type;
    const finalId = id || body?.id;
    return this.academicService.deleteEntity(finalType!, finalId!);
  }
}

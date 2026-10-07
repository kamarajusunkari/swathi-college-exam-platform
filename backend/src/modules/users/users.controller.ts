import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { OnboardUserDto, BulkOnboardDto, UpdateUserRoleDto } from "./dto/user.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get("student/dashboard")
  @Roles("STUDENT", "SUPER_ADMIN", "ADMIN")
  getStudentDashboard(@CurrentUser("id") userId: string) {
    return this.usersService.getStudentDashboard(userId);
  }

  @Get("student/exams")
  @Roles("STUDENT", "SUPER_ADMIN", "ADMIN")
  getStudentExams(@CurrentUser("id") userId: string) {
    return this.usersService.getStudentExams(userId);
  }

  @Get("student/fees")
  @Roles("STUDENT", "SUPER_ADMIN", "ADMIN")
  getStudentFees(@CurrentUser("id") userId: string) {
    return this.usersService.getStudentFees(userId);
  }

  @Get("student/hall-tickets")
  @Roles("STUDENT", "SUPER_ADMIN", "ADMIN")
  getStudentHallTickets(@CurrentUser("id") userId: string) {
    return this.usersService.getStudentHallTickets(userId);
  }

  @Get("student/results")
  @Roles("STUDENT", "SUPER_ADMIN", "ADMIN")
  getStudentResults(@CurrentUser("id") userId: string) {
    return this.usersService.getStudentResults(userId);
  }

  @Get(":id")
  getUserById(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }

  @Post("onboard")
  @Roles("SUPER_ADMIN", "ADMIN")
  onboardUser(
    @Body() dto: OnboardUserDto,
    @CurrentUser("id") adminId?: string
  ) {
    return this.usersService.onboardUser(dto, adminId);
  }

  @Post("bulk-onboard")
  @Roles("SUPER_ADMIN", "ADMIN")
  bulkOnboard(@Body() dto: BulkOnboardDto) {
    return this.usersService.bulkOnboard(dto);
  }

  @Post("update-role")
  @Roles("SUPER_ADMIN", "ADMIN")
  updateRole(
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser("id") adminId?: string
  ) {
    return this.usersService.updateRole(dto, adminId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN")
  deleteUser(
    @Param("id") id: string,
    @CurrentUser("id") currentAdminId: string
  ) {
    return this.usersService.deleteUser(id, currentAdminId);
  }
}

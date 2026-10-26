import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN")
  getLogs(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("role") role?: string,
    @Query("action") action?: string,
    @Query("entity") entity?: string,
    @Query("search") search?: string,
    @Query("userId") userId?: string,
  ) {
    return this.auditService.getLogs({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      action,
      entity,
      search,
      userId,
    });
  }

  @Get("summary")
  @Roles("SUPER_ADMIN", "ADMIN")
  getAuditSummary() {
    return this.auditService.getAuditSummary();
  }

  @Get("my-logs")
  getMyLogs(@CurrentUser("id") userId: string) {
    return this.auditService.getMyLogs(userId);
  }
}

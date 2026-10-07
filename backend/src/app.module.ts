import { Module, Controller, Get } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AcademicModule } from "./modules/academic/academic.module";
import { ExamsModule } from "./modules/exams/exams.module";
import { EvaluationModule } from "./modules/evaluation/evaluation.module";
import { AiModule } from "./modules/ai/ai.module";
import { FeesModule } from "./modules/fees/fees.module";
import { HallTicketsModule } from "./modules/hall-tickets/hall-tickets.module";
import { ResultsModule } from "./modules/results/results.module";
import { UsersModule } from "./modules/users/users.module";
import { AuditModule } from "./modules/audit/audit.module";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get("health")
  getHealth() {
    return {
      status: "HEALTHY",
      service: "Swathi College Examination API Engine (NestJS)",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AcademicModule,
    ExamsModule,
    EvaluationModule,
    AiModule,
    FeesModule,
    HallTicketsModule,
    ResultsModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

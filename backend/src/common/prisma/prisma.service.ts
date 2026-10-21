import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log("✅ Prisma connected to database successfully.");
        return;
      } catch (error: any) {
        retries -= 1;
        this.logger.warn(
          `⚠️ Database connection attempt failed (${error?.message || error}). Retrying in 2s... (${retries} attempts left)`
        );
        if (retries === 0) {
          this.logger.error("❌ Database connection could not be established during startup. Server will remain running and attempt on demand.");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

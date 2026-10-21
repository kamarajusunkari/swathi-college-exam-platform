import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 5000;
  const configuredOrigin = process.env.CORS_ORIGIN;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow server-to-server, curl, or same-origin requests with no Origin header
      if (!origin) return callback(null, true);

      // Allow localhost, Vercel preview/production domains (*.vercel.app), or configured origin
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".vercel.app") ||
        (configuredOrigin && (origin === configuredOrigin || configuredOrigin === "*"))
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  app.use(cookieParser());

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(PORT, "0.0.0.0");
  console.log(`🚀 Swathi College NestJS API Engine running on http://0.0.0.0:${PORT}/api`);
  console.log(`📡 CORS configured for localhost, .vercel.app, and custom origins`);
}

bootstrap();

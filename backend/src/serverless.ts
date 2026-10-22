import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

const server: Express = express();
let isInitialized = false;

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const configuredOrigin = process.env.CORS_ORIGIN;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true);
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

  await app.init();
  isInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!isInitialized) {
      await bootstrapServerless();
    }
    return server(req, res);
  } catch (err: any) {
    console.error("SERVERLESS BOOTSTRAP FAILED:", err);
    return res.status(500).json({
      success: false,
      error: "SERVERLESS_INITIALIZATION_ERROR",
      message: err?.message || String(err),
      details: "Check backend Vercel environment variables (DATABASE_URL, JWT_SECRET).",
    });
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { jwtVerify } from "jose";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "swathi-college-exam-platform-ultra-secure-jwt-secret-key-2026"
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.access_token ||
      request.cookies?.auth_token ||
      request.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException("Authentication token required");
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      request.user = payload;
      return true;
    } catch {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException("Invalid or expired session token");
    }
  }
}

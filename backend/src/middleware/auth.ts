import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "swathi-college-exam-platform-ultra-secure-jwt-secret-key-2026"
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
  studentProfileId?: string;
  teacherProfileId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token =
      req.cookies?.auth_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authentication token required" });
      return;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    req.user = payload as unknown as AuthenticatedUser;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session token" });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Access denied. Insufficient privileges." });
      return;
    }
    next();
  };
}

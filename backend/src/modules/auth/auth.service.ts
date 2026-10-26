import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { LoginDto } from "./dto/login.dto";
import { SwitchRoleDto } from "./dto/switch-role.dto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "swathi-college-exam-platform-ultra-secure-jwt-secret-key-2026"
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "swathi-college-exam-platform-ultra-secure-refresh-jwt-secret-key-2026"
);

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private async generateTokens(payload: Record<string, any>) {
    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({ id: payload.id, email: payload.email, type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_REFRESH_SECRET);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto) {
    const { email, username, password } = loginDto;
    const identifier = ((email || username || "") as string).trim().toLowerCase();

    if (!identifier || !password) {
      throw new BadRequestException("Please enter your username, email, or roll number and password.");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { email: { startsWith: identifier + "@", mode: "insensitive" } },
          { studentProfile: { rollNo: { equals: identifier, mode: "insensitive" } } },
          { studentProfile: { studentId: { equals: identifier, mode: "insensitive" } } },
          { studentProfile: { admissionNo: { equals: identifier, mode: "insensitive" } } },
          { teacherProfile: { employeeId: { equals: identifier, mode: "insensitive" } } },
        ],
      },
      include: {
        studentProfile: {
          include: { class: true, section: true, group: true, academicYear: true },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid username/email or inactive institutional account.");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException("Incorrect password. Please verify your credentials.");
    }

    // Enforce time-based access control for operational roles (SUPER_ADMIN is unrestricted)
    if (user.role !== "SUPER_ADMIN" && user.isTimeRestricted) {
      const now = new Date();
      if (user.timeWindowStart && now < new Date(user.timeWindowStart)) {
        throw new UnauthorizedException("Your institutional operational access window has not commenced yet.");
      }
      if (user.timeWindowEnd && now > new Date(user.timeWindowEnd)) {
        throw new UnauthorizedException("Your institutional operational access window has expired. Contact administrator.");
      }
      if (user.dailyStartTime && user.dailyEndTime) {
        const currentHourMin = now.toTimeString().slice(0, 5);
        if (currentHourMin < user.dailyStartTime || currentHourMin > user.dailyEndTime) {
          throw new UnauthorizedException(
            `Account access restricted to official hours: ${user.dailyStartTime} - ${user.dailyEndTime}.`
          );
        }
      }
    }

    const parsedPermissions = user.permissions
      ? typeof user.permissions === "string"
        ? (() => {
            try {
              return JSON.parse(user.permissions);
            } catch {
              return [];
            }
          })()
        : user.permissions
      : [];

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      permissions: parsedPermissions,
      studentProfileId: user.studentProfile?.id,
      teacherProfileId: user.teacherProfile?.id,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    try {
      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "USER_LOGIN_SUCCESS",
            entity: "User",
            entityId: user.id,
            details: JSON.stringify({ role: user.role, email: user.email, name: user.name }),
          },
        });
      }
    } catch (logErr) {
      console.warn("Audit log skipped:", logErr);
    }

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        ...payload,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    };
  }

  async refreshToken(refreshTokenStr: string) {
    if (!refreshTokenStr) {
      throw new UnauthorizedException("Refresh token is required.");
    }

    let payload: any;
    try {
      const verified = await jwtVerify(refreshTokenStr, JWT_REFRESH_SECRET);
      payload = verified.payload;
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token. Please sign in again.");
    }

    if (!payload?.id) {
      throw new UnauthorizedException("Malformed refresh token.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id, isActive: true },
      include: {
        studentProfile: {
          include: { class: true, section: true, group: true, academicYear: true },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User session expired or deactivated.");
    }

    const parsedPermissions = user.permissions
      ? typeof user.permissions === "string"
        ? (() => {
            try {
              return JSON.parse(user.permissions);
            } catch {
              return [];
            }
          })()
        : user.permissions
      : [];

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      permissions: parsedPermissions,
      studentProfileId: user.studentProfile?.id,
      teacherProfileId: user.teacherProfile?.id,
    };

    const { accessToken, refreshToken } = await this.generateTokens(userPayload);

    return {
      success: true,
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        ...userPayload,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    };
  }

  async getMe(token?: string, cookieEmail?: string) {
    if (!token && !cookieEmail) {
      throw new UnauthorizedException("Unauthenticated");
    }

    let user: any = null;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        user = await this.prisma.user.findUnique({
          where: { id: (payload as any).id, isActive: true },
          include: {
            studentProfile: {
              include: { class: true, section: true, group: true, academicYear: true },
            },
            teacherProfile: {
              include: {
                assignments: {
                  include: { subject: true, class: true },
                },
              },
            },
          },
        });
      } catch {
        // Fallback to cookie email
      }
    }

    if (!user && cookieEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: cookieEmail, isActive: true },
        include: {
          studentProfile: {
            include: { class: true, section: true, group: true, academicYear: true },
          },
          teacherProfile: {
            include: {
              assignments: {
                include: { subject: true, class: true },
              },
            },
          },
        },
      });
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        permissions: user.permissions ? (typeof user.permissions === "string" ? JSON.parse(user.permissions) : user.permissions) : [],
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
    };
  }

  async switchRole(dto: SwitchRoleDto) {
    const { role } = dto;
    const targetUser = await this.prisma.user.findFirst({
      where: { role, isActive: true },
      include: {
        studentProfile: {
          include: { class: true, section: true, group: true, academicYear: true },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true },
            },
          },
        },
      },
    });

    if (!targetUser) {
      throw new NotFoundException(`No active user found with role ${role}`);
    }

    const payload = {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      studentProfileId: targetUser.studentProfile?.id,
      teacherProfileId: targetUser.teacherProfile?.id,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    try {
      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId: targetUser.id,
            action: "USER_ROLE_SWITCHED",
            entity: "User",
            entityId: targetUser.id,
            details: JSON.stringify({ role: targetUser.role, email: targetUser.email }),
          },
        });
      }
    } catch {}

    return {
      success: true,
      message: `Switched session to ${role}`,
      token: accessToken,
      accessToken,
      refreshToken,
      email: targetUser.email,
      user: {
        ...payload,
        studentProfile: targetUser.studentProfile,
        teacherProfile: targetUser.teacherProfile,
      },
    };
  }
}

import { Controller, Post, Get, Body, Req, Res, Inject, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SwitchRoleDto } from "./dto/switch-role.dto";
import { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService)) 
    private authService: AuthService
  ) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    const isProd = process.env.NODE_ENV === "production";

    // Access token (15 mins)
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    // Refresh token (7 days)
    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Backward-compatible auth_token
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("swathi_auth_user", result.user.email, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return result;
  }

  @Public()
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.refreshToken(refreshToken);
    const isProd = process.env.NODE_ENV === "production";

    // Set renewed cookies
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return {
      success: true,
      message: "Tokens successfully refreshed",
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Get("me")
  async getMe(@Req() req: Request) {
    const token =
      req.cookies?.access_token ||
      req.cookies?.auth_token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const cookieEmail = req.cookies?.swathi_auth_user;
    return this.authService.getMe(token, cookieEmail);
  }

  @Public()
  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("swathi_auth_user", { path: "/" });
    return { success: true, message: "Logged out successfully" };
  }

  @Public()
  @Post("switch-role")
  async switchRole(@Body() dto: SwitchRoleDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.switchRole(dto);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("swathi_auth_user", result.email, {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return {
      success: true,
      message: result.message,
      token: result.token,
      accessToken: result.accessToken,
      user: result.user,
    };
  }
}

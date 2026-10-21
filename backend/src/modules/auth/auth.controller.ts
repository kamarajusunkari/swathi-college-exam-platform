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

    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("swathi_auth_user", result.user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return result;
  }

  @Public()
  @Get("me")
  async getMe(@Req() req: Request) {
    const token =
      req.cookies?.auth_token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const cookieEmail = req.cookies?.swathi_auth_user;
    return this.authService.getMe(token, cookieEmail);
  }

  @Public()
  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("swathi_auth_user", { path: "/" });
    return { success: true, message: "Logged out successfully" };
  }

  @Public()
  @Post("switch-role")
  async switchRole(@Body() dto: SwitchRoleDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.switchRole(dto);

    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("swathi_auth_user", result.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return {
      success: true,
      message: result.message,
      token: result.token,
      user: result.user,
    };
  }
}

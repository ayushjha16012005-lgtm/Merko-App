import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '@/lib/response';
import { getEnv } from '@merko/config';

const env = getEnv();
const isProd = env.NODE_ENV === 'production';

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return sendSuccess(res, user, 201);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, { user, accessToken }, 200);
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return sendSuccess(res, { message: 'Logged out successfully' });
  }

  async logoutAll(req: Request, res: Response) {
    if (!req.user) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    await authService.logoutAll(req.user.id);
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return sendSuccess(res, { message: 'Logged out of all sessions successfully' });
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      res.status(401);
      throw new Error('Refresh token is missing');
    }

    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    return sendSuccess(res, { user, accessToken }, 200);
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, result);
  }

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    return sendSuccess(res, result);
  }

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return sendSuccess(res, result);
  }

  async getProfile(req: Request, res: Response) {
    if (!req.user) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    return sendSuccess(res, { user: req.user });
  }
}

export const authController = new AuthController();

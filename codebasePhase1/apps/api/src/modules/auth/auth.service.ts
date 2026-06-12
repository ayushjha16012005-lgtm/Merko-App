import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authRepository } from './auth.repository';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '@/errors';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-tokens';
import type { CreateUserDto, UserRole, UserStatus } from '@merko/types';
import { emailService } from '@/modules/email/email.service';

export class AuthService {
  async register(data: CreateUserDto) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ForbiddenError('Email already registered');
    }

    if (!data.password) {
      throw new ForbiddenError('Password is required');
    }

    // Default status: ADMIN is PENDING_APPROVAL, CUSTOMER is ACTIVE
    const status = (data.role === 'ADMIN' ? 'PENDING_APPROVAL' : 'ACTIVE') as UserStatus;

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await authRepository.createUser({
      ...data,
      passwordHash,
      status,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status as UserStatus,
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      permissions: user.permissions ? user.permissions.split(',') : [],
    };

    if (status === 'PENDING_APPROVAL') {
      emailService.sendAdminRegistrationNotification({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        businessName: user.businessName,
      });
    }

    return userPayload;
  }

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'PENDING_APPROVAL') {
      throw new UnauthorizedError('Your account is pending approval. You can access the management portal once approved.');
    }
    if (user.status === 'PENDING_ACTIVATION') {
      throw new UnauthorizedError('Your account invitation is pending activation. Please follow the instructions sent to your email.');
    }
    if (user.status === 'REJECTED') {
      throw new UnauthorizedError('Your request has been rejected.');
    }
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended.');
    }
    if (user.status !== 'ACTIVE' || !user.isActive) {
      throw new UnauthorizedError('User account is not active');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status as UserStatus,
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      permissions: user.permissions ? user.permissions.split(',') : [],
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken({ id: user.id });

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return { user: userPayload, accessToken, refreshToken };
  }

  async logout(token: string) {
    await authRepository.deleteRefreshToken(token);
  }

  async logoutAll(userId: string) {
    await authRepository.deleteAllRefreshTokensForUser(userId);
  }

  async refresh(token: string) {
    const refreshTokenRecord = await authRepository.findRefreshToken(token);

    if (!refreshTokenRecord) {
      throw new UnauthorizedError('Invalid or reused refresh token');
    }

    if (refreshTokenRecord.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(token);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await authRepository.findUserById(refreshTokenRecord.userId);
    if (!user || user.status !== 'ACTIVE' || !user.isActive) {
      await authRepository.deleteRefreshToken(token);
      throw new UnauthorizedError('User account not found or inactive');
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status as UserStatus,
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      permissions: user.permissions ? user.permissions.split(',') : [],
    };

    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // Rotate refresh token
    await authRepository.deleteRefreshToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await authRepository.createRefreshToken(user.id, newRefreshToken, expiresAt);

    return { user: userPayload, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Prevent user enumeration
      return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await authRepository.createPasswordResetToken(user.id, token, expiresAt);

    console.log(`[PASSWORD RESET] Link for ${email}: http://localhost:3000/reset-password?token=${token}`);
    
    return { success: true, token };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetTokenRecord = await authRepository.findPasswordResetToken(token);
    if (!resetTokenRecord) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      await authRepository.deletePasswordResetToken(token);
      throw new UnauthorizedError('Reset token expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepository.updateUserPassword(resetTokenRecord.userId, passwordHash);

    // Cleanup
    await authRepository.deletePasswordResetToken(token);
    await authRepository.deleteAllRefreshTokensForUser(resetTokenRecord.userId);

    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepository.updateUserPassword(userId, passwordHash);

    // Invalidate all other sessions
    await authRepository.deleteAllRefreshTokensForUser(userId);

    return { success: true };
  }
}

export const authService = new AuthService();

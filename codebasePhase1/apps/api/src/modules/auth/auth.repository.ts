import { prisma } from '@/config/db';
import type { User, RefreshToken, PasswordResetToken } from '@prisma/client';
import type { CreateUserDto } from '@merko/types';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    if (!data.passwordHash) {
      throw new Error('Password hash is required for database creation');
    }
    return prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        passwordHash: data.passwordHash,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
        businessName: data.businessName || null,
        businessAddress: data.businessAddress || null,
        emailVerified: false,
        isActive: true,
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
      },
    });
  }

  // Refresh Token queries
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // Password Reset queries
  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    // Clean old tokens first
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { token } });
  }
}

export const authRepository = new AuthRepository();

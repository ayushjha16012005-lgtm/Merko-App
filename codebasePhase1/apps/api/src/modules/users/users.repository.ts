import type { User, SuperAdminInvitation } from '@prisma/client';
import { prisma } from '@/config/db';

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { superAdminInvitation: true }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAdmins(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findSuperAdmins(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    passwordHash: string;
    role: string;
    status: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status,
        emailVerified: true,
        isActive: true,
      },
    });
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    const updateData: any = {
      status,
      isActive: status === 'ACTIVE',
    };
    if (status === 'ACTIVE' && user && user.role === 'ADMIN' && !user.permissions) {
      updateData.permissions = 'orders,products,categories,shipments,returns,analytics';
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateUserPermissions(id: string, permissions: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { permissions },
    });
  }

  async createInvitation(userId: string, token: string, expiresAt: Date): Promise<SuperAdminInvitation> {
    return prisma.superAdminInvitation.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findInvitationByToken(token: string) {
    return prisma.superAdminInvitation.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteInvitation(token: string): Promise<void> {
    await prisma.superAdminInvitation.deleteMany({
      where: { token },
    });
  }

  async findAuditLogs() {
    return prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export const usersRepository = new UsersRepository();

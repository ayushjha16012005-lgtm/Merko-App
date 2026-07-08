import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { User } from '@prisma/client';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '@/errors';
import { usersRepository } from '@/modules/users/users.repository';
import { emailService } from '@/modules/email/email.service';
import { logAuditEvent } from '@/modules/audit/audit.service';
import { verifyEmailActionToken } from '@/lib/auth-tokens';
import { prisma } from '@/config/db';

export class UsersService {
  async getUserById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getAdminRequests() {
    return usersRepository.findAdmins();
  }

  async getSuperAdmins() {
    return usersRepository.findSuperAdmins();
  }

  async updateAdminRequestStatus(
    id: string,
    status: string,
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const targetUser = await usersRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError('Admin user not found');
    }

    if (targetUser.role !== 'ADMIN') {
      throw new ForbiddenError('Target user is not an Admin');
    }

    const previousStatus = targetUser.status;
    if (previousStatus === status) {
      return targetUser;
    }

    // Determine audit action
    let action = '';
    const updateData: any = {
      status,
      isActive: status === 'ACTIVE',
    };

    const actor = await usersRepository.findById(actorId);
    const actorIdentifier = actor ? `${actor.firstName} ${actor.lastName} (${actor.email})` : actorId;

    if (status === 'ACTIVE') {
      action = 'Access Request Approved';
      updateData.approvedBy = actorIdentifier;
      updateData.approvedAt = new Date();
      updateData.rejectedBy = null;
      updateData.rejectedAt = null;
      updateData.suspendedBy = null;
      updateData.suspendedAt = null;
    } else if (status === 'REJECTED') {
      action = 'Access Request Rejected';
      updateData.rejectedBy = actorIdentifier;
      updateData.rejectedAt = new Date();
      updateData.approvedBy = null;
      updateData.approvedAt = null;
      updateData.suspendedBy = null;
      updateData.suspendedAt = null;
    } else if (status === 'SUSPENDED') {
      action = 'Admin Suspended';
      updateData.suspendedBy = actorIdentifier;
      updateData.suspendedAt = new Date();
      updateData.approvedBy = null;
      updateData.approvedAt = null;
      updateData.rejectedBy = null;
      updateData.rejectedAt = null;
    } else {
      action = `Admin status changed to ${status}`;
    }

    if (status === 'ACTIVE' && !targetUser.permissions) {
      updateData.permissions = 'orders,products,categories,shipments,returns,analytics';
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Log audit event
    await logAuditEvent({
      userId: actorId,
      actorRole,
      targetUserId: id,
      action,
      resource: 'User',
      resourceId: id,
      changes: JSON.stringify({ previousStatus, newStatus: status }),
      ipAddress,
      userAgent,
    });

    // Send notification email
    if (status === 'ACTIVE') {
      if (previousStatus === 'PENDING_APPROVAL') {
        emailService.sendAdminApprovalNotification(updatedUser.email);
      } else if (previousStatus === 'SUSPENDED') {
        emailService.sendAdminReactivationNotification(updatedUser.email);
      }
    } else if (status === 'REJECTED') {
      emailService.sendAdminRejectionNotification(updatedUser.email);
    } else if (status === 'SUSPENDED') {
      emailService.sendAdminSuspensionNotification(updatedUser.email);
    }

    return updatedUser;
  }

  async updateAdminPermissions(
    id: string,
    permissions: string[],
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const targetUser = await usersRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError('Admin user not found');
    }

    if (targetUser.role !== 'ADMIN') {
      throw new ForbiddenError('Target user is not an Admin');
    }

    const previousPermissions = targetUser.permissions;
    const permissionsStr = permissions.join(',');

    const updatedUser = await usersRepository.updateUserPermissions(id, permissionsStr);

    await logAuditEvent({
      userId: actorId,
      actorRole,
      targetUserId: id,
      action: 'Permission Updated',
      resource: 'User',
      resourceId: id,
      changes: JSON.stringify({ previousPermissions, newPermissions: permissionsStr }),
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async inviteSuperAdmin(
    data: { fullName: string; email: string; phone?: string },
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ForbiddenError('Email already registered');
    }

    // Split full name
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Super';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    // Create a random password hash for pending user
    const placeholderPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(placeholderPassword, 10);

    const pendingUser = await usersRepository.createUser({
      email: data.email,
      firstName,
      lastName,
      phone: data.phone,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'PENDING_ACTIVATION',
    });

    // Generate activation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await usersRepository.createInvitation(pendingUser.id, token, expiresAt);

    // Send Email
    emailService.sendSuperAdminInvitation({ email: data.email, fullName: data.fullName }, token);

    // Audit Log
    await logAuditEvent({
      userId: actorId,
      actorRole,
      targetUserId: pendingUser.id,
      action: 'Super Admin Created',
      resource: 'User',
      resourceId: pendingUser.id,
      changes: JSON.stringify({ email: data.email, status: 'PENDING_ACTIVATION' }),
      ipAddress,
      userAgent,
    });

    return pendingUser;
  }

  async activateSuperAdmin(token: string, password: string, ipAddress?: string, userAgent?: string) {
    const invitation = await usersRepository.findInvitationByToken(token);
    if (!invitation) {
      throw new NotFoundError('Invalid invitation token');
    }

    if (invitation.expiresAt < new Date()) {
      await usersRepository.deleteInvitation(token);
      throw new UnauthorizedError('Invitation token has expired');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Update User
    await prisma.user.update({
      where: { id: invitation.userId },
      data: {
        passwordHash,
        status: 'ACTIVE',
        isActive: true,
      },
    });

    // Delete Invitation
    await usersRepository.deleteInvitation(token);

    // Audit Log
    await logAuditEvent({
      userId: invitation.userId,
      actorRole: 'SUPER_ADMIN',
      targetUserId: invitation.userId,
      action: 'Super Admin Activated',
      resource: 'User',
      resourceId: invitation.userId,
      changes: JSON.stringify({ status: 'ACTIVE' }),
      ipAddress,
      userAgent,
    });

    return { success: true };
  }

  async updateSuperAdminStatus(
    id: string,
    actionType: 'suspend' | 'reactivate' | 'remove',
    actorId: string,
    actorRole: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const targetUser = await usersRepository.findById(id);
    if (!targetUser) {
      throw new NotFoundError('Super Admin not found');
    }

    if (targetUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Target user is not a Super Admin');
    }

    if (targetUser.isPlatformSuperAdmin) {
      throw new ForbiddenError('Platform Super Admin cannot be modified, suspended, or deleted');
    }

    if (id === actorId) {
      throw new ForbiddenError('You cannot suspend or remove yourself');
    }

    let action = '';
    let updatedUser: User | null = null;

    if (actionType === 'suspend') {
      action = 'Super Admin Suspended';
      updatedUser = await usersRepository.updateUserStatus(id, 'SUSPENDED');
    } else if (actionType === 'reactivate') {
      action = 'Super Admin Activated'; // or Reactivated
      updatedUser = await usersRepository.updateUserStatus(id, 'ACTIVE');
    } else if (actionType === 'remove') {
      action = 'Super Admin Removed';
      // Delete user
      await prisma.user.delete({ where: { id } });
    }

    // Audit Log
    await logAuditEvent({
      userId: actorId,
      actorRole,
      targetUserId: id,
      action,
      resource: 'User',
      resourceId: id,
      changes: JSON.stringify({ actionType }),
      ipAddress,
      userAgent,
    });

    return updatedUser || { id, deleted: true };
  }

  async handleEmailAction(token: string) {
    try {
      const decoded = verifyEmailActionToken(token);
      const user = await usersRepository.findById(decoded.userId);
      if (!user) {
        return `
          <html>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
              <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
                <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">User Not Found</h1>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">The user associated with this approval link could not be found in our database.</p>
              </div>
            </body>
          </html>
        `;
      }

      if (user.status !== 'PENDING_APPROVAL') {
        return `
          <html>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
              <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
                <h1 style="color: #eab308; font-size: 24px; margin-bottom: 16px;">Already Processed</h1>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This registration request has already been processed. The current status is: <strong>${user.status}</strong>.</p>
              </div>
            </body>
          </html>
        `;
      }

      const status = decoded.action === 'approve' ? 'ACTIVE' : 'REJECTED';
      const actionMessage = decoded.action === 'approve' ? 'Approved' : 'Rejected';
      const auditAction = status === 'ACTIVE' ? 'Access Request Approved' : 'Access Request Rejected';

      const updateData: any = {
        status,
        isActive: status === 'ACTIVE',
      };
      if (status === 'ACTIVE') {
        updateData.approvedBy = 'System (Email Link)';
        updateData.approvedAt = new Date();
      } else {
        updateData.rejectedBy = 'System (Email Link)';
        updateData.rejectedAt = new Date();
      }
      if (status === 'ACTIVE' && !user.permissions) {
        updateData.permissions = 'orders,products,categories,shipments,returns,analytics';
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Audit Log (system actor)
      await logAuditEvent({
        userId: null,
        actorRole: 'SYSTEM',
        targetUserId: user.id,
        action: auditAction,
        resource: 'User',
        resourceId: user.id,
        changes: JSON.stringify({ previousStatus: 'PENDING_APPROVAL', newStatus: status }),
      });

      // Send Email
      if (status === 'ACTIVE') {
        emailService.sendAdminApprovalNotification(user.email);
      } else {
        emailService.sendAdminRejectionNotification(user.email);
      }

      return `
        <html>
          <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
              <div style="width: 48px; height: 48px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px; font-size: 24px; font-weight: bold;">✓</div>
              <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Request Processed</h1>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">The user <strong>${user.firstName} ${user.lastName}</strong> has been successfully <strong>${actionMessage.toLowerCase()}</strong>.</p>
            </div>
          </body>
        </html>
      `;
    } catch {
      return `
        <html>
          <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; text-align: center;">
              <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Invalid Token</h1>
              <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This email action token is invalid or has expired.</p>
            </div>
          </body>
        </html>
      `;
    }
  }

  async getAuditLogs() {
    return usersRepository.findAuditLogs();
  }
}

export const usersService = new UsersService();

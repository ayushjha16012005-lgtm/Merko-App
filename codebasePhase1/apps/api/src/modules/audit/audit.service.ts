import { prisma } from '@/config/db';

export async function logAuditEvent(params: {
  userId?: string | null;
  actorRole?: string | null;
  targetUserId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  changes?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        actorRole: params.actorRole || null,
        targetUserId: params.targetUserId || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        changes: params.changes || null,
        metadata: params.metadata || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

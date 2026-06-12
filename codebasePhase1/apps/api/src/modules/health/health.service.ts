import { prisma } from '@/config/db';

export class HealthService {
  async checkDatabase(): Promise<'ok' | 'down'> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'down';
    }
  }
}

export const healthService = new HealthService();

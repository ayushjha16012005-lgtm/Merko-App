import type { Request, Response } from 'express';
import { healthService } from '@/modules/health/health.service';

export async function getHealth(_req: Request, res: Response): Promise<Response> {
  const db = await healthService.checkDatabase();

  if (db === 'down') {
    return res.status(500).json({
      success: false,
      db: 'down',
      server: 'ok',
    });
  }

  return res.status(200).json({
    success: true,
    db: 'ok',
    server: 'ok',
  });
}

export function getLive(_req: Request, res: Response): Response {
  return res.status(200).json({
    status: 'alive',
  });
}

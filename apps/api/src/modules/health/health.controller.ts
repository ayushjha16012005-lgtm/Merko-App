import { Request, Response } from 'express';
import { prisma } from '../../config/db';

export async function getHealth(req: Request, res: Response) {
  try {
    // Quick validation of DB connection
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      db: 'ok',
      server: 'ok',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      db: 'down',
      server: 'ok',
    });
  }
}

export function getLive(req: Request, res: Response) {
  return res.status(200).json({
    status: 'alive',
  });
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { setUserIdForRLS } from '../database/prisma';

export async function setRLSUserId(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user?.id) {
      await setUserIdForRLS(req.user.id);
    }
    next();
  } catch (error) {
    console.error('Error setting RLS user_id:', error);
    next();
  }
}


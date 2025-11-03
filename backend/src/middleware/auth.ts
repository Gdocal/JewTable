import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/auth.service';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('No token');
    
    req.user = AuthService.verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }
};

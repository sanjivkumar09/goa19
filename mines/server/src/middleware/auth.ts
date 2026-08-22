import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mines_admin_super_secret_jwt_key_2026_x99';

export interface AdminAuthRequest extends Request {
  isAdmin?: boolean;
}

export function requireAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid admin token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ADMIN_SESSION_SECRET) as { role: string };
    if (decoded && decoded.role === 'admin') {
      req.isAdmin = true;
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }
}

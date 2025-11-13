import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../auth/jwt.service';
import { CookieService } from '../auth/cookie.service';
import { UserRepository } from '../repositories/UserRepository';
import { MembershipRepository } from '../repositories/MembershipRepository';
import { Role } from '../../domain/enums/Role';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    activeCompanyId: string | null;
  };
}

export class AuthMiddleware {
  private jwtService: JwtService;
  private cookieService: CookieService;
  private userRepository: UserRepository;
  private membershipRepository: MembershipRepository;

  constructor() {
    this.jwtService = new JwtService();
    this.cookieService = new CookieService();
    this.userRepository = new UserRepository();
    this.membershipRepository = new MembershipRepository();
  }

  authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.cookieService.getTokenFromCookie(req.cookies);

      if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const payload = this.jwtService.verifyToken(token);
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        activeCompanyId: user.activeCompanyId,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  requireCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.activeCompanyId) {
      res.status(400).json({ error: 'No active company selected' });
      return;
    }

    const membership = await this.membershipRepository.findByUserAndCompany(
      req.user.id,
      req.user.activeCompanyId
    );

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this company' });
      return;
    }

    next();
  };

  requireRole = (allowedRoles: Role[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user?.activeCompanyId) {
        res.status(400).json({ error: 'No active company selected' });
        return;
      }

      const membership = await this.membershipRepository.findByUserAndCompany(
        req.user.id,
        req.user.activeCompanyId
      );

      if (!membership) {
        res.status(403).json({ error: 'Not a member of this company' });
        return;
      }

      if (!allowedRoles.includes(membership.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  };
}


import { Response, NextFunction } from 'express';
import { InviteUseCase } from '../../application/invite/InviteUseCase';
import { AuthRequest } from '../../infrastructure/middleware/auth.middleware';
import { Role } from '../../domain/enums/Role';

export class InviteController {
  private inviteUseCase: InviteUseCase;

  constructor() {
    this.inviteUseCase = new InviteUseCase();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { email, role } = req.body;

      const result = await this.inviteUseCase.create({
        email,
        companyId: id,
        invitedBy: req.user.id,
        role: role ? (role as Role) : undefined,
      });

      res.status(201).json({
        message: 'Invite created successfully',
        invite: {
          id: result.invite.id,
          email: result.invite.email,
          token: result.invite.token,
          role: result.invite.role,
          expiresAt: result.invite.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}


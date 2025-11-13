import { Request, Response } from 'express';
import { AuthUseCase } from '../../application/auth/AuthUseCase';
import { InviteUseCase } from '../../application/invite/InviteUseCase';
import { JwtService } from '../../infrastructure/auth/jwt.service';
import { CookieService } from '../../infrastructure/auth/cookie.service';

export class AuthController {
  private authUseCase: AuthUseCase;
  private inviteUseCase: InviteUseCase;
  private jwtService: JwtService;
  private cookieService: CookieService;

  constructor() {
    this.authUseCase = new AuthUseCase();
    this.inviteUseCase = new InviteUseCase();
    this.jwtService = new JwtService();
    this.cookieService = new CookieService();
  }

  signUp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const result = await this.authUseCase.signUp({ email, password, name });

      const token = this.jwtService.generateToken({
        userId: result.user.id,
        email: result.user.email,
        activeCompanyId: result.user.activeCompanyId,
      });

      this.cookieService.setToken(res, token);

      res.status(201).json({
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  };

  acceptInvite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password, name } = req.body;

      const result = await this.inviteUseCase.accept({ token, password, name });

      const jwtToken = this.jwtService.generateToken({
        userId: result.user.id,
        email: result.user.email,
        activeCompanyId: result.user.activeCompanyId,
      });

      this.cookieService.setToken(res, jwtToken);

      res.status(200).json({
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  };
}


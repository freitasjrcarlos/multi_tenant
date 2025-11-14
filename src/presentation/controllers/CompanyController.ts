import { Response, NextFunction } from 'express';
import { CompanyUseCase } from '../../application/company/CompanyUseCase';
import { AuthRequest } from '../../infrastructure/middleware/auth.middleware';
import { JwtService } from '../../infrastructure/auth/jwt.service';
import { CookieService } from '../../infrastructure/auth/cookie.service';

export class CompanyController {
  private companyUseCase: CompanyUseCase;
  private jwtService: JwtService;
  private cookieService: CookieService;

  constructor() {
    this.companyUseCase = new CompanyUseCase();
    this.jwtService = new JwtService();
    this.cookieService = new CookieService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, logo } = req.body;

      const result = await this.companyUseCase.create({
        name,
        logo,
        userId: req.user.id,
      });

      await this.companyUseCase.select({
        userId: req.user.id,
        companyId: result.company.id,
      });

      const token = this.jwtService.generateToken({
        userId: req.user.id,
        email: req.user.email,
        activeCompanyId: result.company.id,
      });

      this.cookieService.setToken(res, token);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.companyUseCase.list({
        userId: req.user.id,
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  select = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      await this.companyUseCase.select({
        userId: req.user.id,
        companyId: id,
      });

      const token = this.jwtService.generateToken({
        userId: req.user.id,
        email: req.user.email,
        activeCompanyId: id,
      });

      this.cookieService.setToken(res, token);

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const result = await this.companyUseCase.getById({
        userId: req.user.id,
        companyId: id,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}


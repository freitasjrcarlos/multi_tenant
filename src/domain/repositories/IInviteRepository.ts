import { Invite } from '../entities/Invite';
import { Role } from '../enums/Role';

export interface IInviteRepository {
  create(data: {
    email: string;
    companyId: string;
    token: string;
    role: Role;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<Invite>;
  findByToken(token: string): Promise<Invite | null>;
  findByEmailAndCompany(email: string, companyId: string): Promise<Invite | null>;
  updateAccepted(id: string): Promise<Invite>;
  delete(id: string): Promise<void>;
}


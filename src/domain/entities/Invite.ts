import { Role } from '../enums/Role';

export interface Invite {
  id: string;
  email: string;
  companyId: string;
  token: string;
  role: Role;
  invitedBy: string;
  accepted: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}


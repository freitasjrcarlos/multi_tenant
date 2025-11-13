import { Role } from '../enums/Role';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  activeCompanyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithMemberships extends User {
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  userId: string;
  companyId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}


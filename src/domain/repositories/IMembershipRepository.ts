import { Role } from '../enums/Role';

export interface Membership {
  id: string;
  userId: string;
  companyId: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembershipRepository {
  create(data: { userId: string; companyId: string; role: Role }): Promise<Membership>;
  findById(id: string): Promise<Membership | null>;
  findByUserAndCompany(userId: string, companyId: string): Promise<Membership | null>;
  findByCompanyId(companyId: string): Promise<Membership[]>;
  findByUserId(userId: string): Promise<Membership[]>;
  delete(id: string): Promise<void>;
}


import { Company, CompanyWithMembers } from '../entities/Company';

export interface ICompanyRepository {
  create(data: { name: string; logo?: string }): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ companies: Company[]; total: number }>;
  findByIdWithMembers(id: string): Promise<Company | null>;
  findByIdForUser(id: string, userId: string): Promise<Company>;
  findByIdWithMembersForUser(id: string, userId: string): Promise<CompanyWithMembers>;
}


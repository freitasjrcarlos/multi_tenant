import { Company } from '../entities/Company';

export interface ICompanyRepository {
  create(data: { name: string; logo?: string }): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByUserId(userId: string): Promise<Company[]>;
  findByIdWithMembers(id: string): Promise<Company | null>;
}


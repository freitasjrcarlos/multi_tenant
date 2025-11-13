import { User } from '../entities/User';

export interface IUserRepository {
  create(data: { email: string; password: string; name: string }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateActiveCompany(userId: string, companyId: string | null): Promise<User>;
  findByIdWithMemberships(id: string): Promise<User | null>;
}


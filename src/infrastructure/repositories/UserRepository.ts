import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { prisma } from '../database/prisma';

export class UserRepository implements IUserRepository {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  async create(data: { email: string; password: string; name: string }): Promise<User> {
    const user = await this.client.user.create({
      data,
    });
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { email },
    });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { id },
    });
    return user ? this.toDomain(user) : null;
  }

  async updateActiveCompany(userId: string, companyId: string | null): Promise<User> {
    const user = await this.client.user.update({
      where: { id: userId },
      data: { activeCompanyId: companyId },
    });
    return this.toDomain(user);
  }

  async findByIdWithMemberships(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            company: true,
          },
        },
      },
    });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      activeCompanyId: user.activeCompanyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}


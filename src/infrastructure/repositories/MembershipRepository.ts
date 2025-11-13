import { PrismaClient, Membership as PrismaMembership, Role as PrismaRole } from '@prisma/client';
import { IMembershipRepository, Membership } from '../../domain/repositories/IMembershipRepository';
import { Role } from '../../domain/enums/Role';
import { prisma } from '../database/prisma';

export class MembershipRepository implements IMembershipRepository {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  async create(data: { userId: string; companyId: string; role: PrismaRole }): Promise<Membership> {
    const membership = await this.client.membership.create({
      data,
    });
    return this.toDomain(membership);
  }

  async findById(id: string): Promise<Membership | null> {
    const membership = await this.client.membership.findUnique({
      where: { id },
    });
    return membership ? this.toDomain(membership) : null;
  }

  async findByUserAndCompany(userId: string, companyId: string): Promise<Membership | null> {
    const membership = await this.client.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });
    return membership ? this.toDomain(membership) : null;
  }

  async findByCompanyId(companyId: string): Promise<Membership[]> {
    const memberships = await this.client.membership.findMany({
      where: { companyId },
    });
    return memberships.map((m) => this.toDomain(m));
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const memberships = await this.client.membership.findMany({
      where: { userId },
    });
    return memberships.map((m) => this.toDomain(m));
  }

  async delete(id: string): Promise<void> {
    await this.client.membership.delete({
      where: { id },
    });
  }

  private toDomain(membership: PrismaMembership): Membership {
    return {
      id: membership.id,
      userId: membership.userId,
      companyId: membership.companyId,
      role: membership.role as unknown as Role,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}


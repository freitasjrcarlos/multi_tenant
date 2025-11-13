import { PrismaClient, Company as PrismaCompany, Membership as PrismaMembership } from '@prisma/client';
import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { Company, CompanyWithMembers } from '../../domain/entities/Company';
import { prisma } from '../database/prisma';
import { validateCompanyAccess } from '../helpers/companyAccess.helper';
import { NotFoundError } from '../../domain/errors/AppError';

export class CompanyRepository implements ICompanyRepository {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  async create(data: { name: string; logo?: string }): Promise<Company> {
    const company = await this.client.company.create({
      data,
    });
    return this.toDomain(company);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.client.company.findUnique({
      where: { id },
    });
    return company ? this.toDomain(company) : null;
  }

  async findByUserId(userId: string): Promise<Company[]> {
    const companies = await this.client.company.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return companies.map((c) => this.toDomain(c));
  }

  async findByIdWithMembers(id: string): Promise<Company | null> {
    const company = await this.client.company.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
    return company ? this.toDomain(company) : null;
  }

  async findByIdForUser(id: string, userId: string): Promise<Company> {
    await validateCompanyAccess(userId, id);
    
    const company = await this.findById(id);
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    return company;
  }

  async findByIdWithMembersForUser(id: string, userId: string): Promise<CompanyWithMembers> {
    await validateCompanyAccess(userId, id);
    
    const company = await this.client.company.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
    
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    
    return this.toDomainWithMembers(company);
  }

  private toDomain(company: PrismaCompany): Company {
    return {
      id: company.id,
      name: company.name,
      logo: company.logo,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  private toDomainWithMembers(company: PrismaCompany & { memberships?: (PrismaMembership & { user?: any })[] }): CompanyWithMembers {
    return {
      id: company.id,
      name: company.name,
      logo: company.logo,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      memberships: company.memberships?.map((m) => ({
        id: m.id,
        userId: m.userId,
        companyId: m.companyId,
        role: m.role,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  }
}


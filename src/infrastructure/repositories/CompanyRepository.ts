import { PrismaClient, Company as PrismaCompany } from '@prisma/client';
import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { Company } from '../../domain/entities/Company';
import { prisma } from '../database/prisma';

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

  private toDomain(company: PrismaCompany): Company {
    return {
      id: company.id,
      name: company.name,
      logo: company.logo,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}


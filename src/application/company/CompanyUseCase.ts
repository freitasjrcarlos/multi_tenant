import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { CompanyRepository } from '../../infrastructure/repositories/CompanyRepository';
import { MembershipRepository } from '../../infrastructure/repositories/MembershipRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Role } from '../../domain/enums/Role';
import { ForbiddenError } from '../../domain/errors/AppError';

export interface CreateCompanyInput {
  name: string;
  logo?: string;
  userId: string;
}

export interface CreateCompanyOutput {
  company: {
    id: string;
    name: string;
    logo: string | null;
    createdAt: Date;
  };
}

export interface ListCompaniesInput {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ListCompaniesOutput {
  companies: Array<{
    id: string;
    name: string;
    logo: string | null;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface SelectCompanyInput {
  userId: string;
  companyId: string;
}

export interface SelectCompanyOutput {
  success: boolean;
}

export interface GetCompanyInput {
  companyId: string;
  userId: string;
}

export interface GetCompanyOutput {
  company: {
    id: string;
    name: string;
    logo: string | null;
    createdAt: Date;
  };
}

export class CompanyUseCase {
  private companyRepository: ICompanyRepository;
  private membershipRepository: IMembershipRepository;
  private userRepository: IUserRepository;

  constructor(
    companyRepository?: ICompanyRepository,
    membershipRepository?: IMembershipRepository,
    userRepository?: IUserRepository
  ) {
    this.companyRepository = companyRepository || new CompanyRepository();
    this.membershipRepository = membershipRepository || new MembershipRepository();
    this.userRepository = userRepository || new UserRepository();
  }

  async create(input: CreateCompanyInput): Promise<CreateCompanyOutput> {
    const company = await this.companyRepository.create({
      name: input.name,
      logo: input.logo,
    });

    await this.membershipRepository.create({
      userId: input.userId,
      companyId: company.id,
      role: Role.OWNER,
    });

    return {
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        createdAt: company.createdAt,
      },
    };
  }

  async list(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    const companies = await this.companyRepository.findByUserId(input.userId);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompanies = companies.slice(startIndex, endIndex);

    return {
      companies: paginatedCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        createdAt: c.createdAt,
      })),
      total: companies.length,
      page,
      limit,
    };
  }

  async select(input: SelectCompanyInput): Promise<SelectCompanyOutput> {
    const membership = await this.membershipRepository.findByUserAndCompany(
      input.userId,
      input.companyId
    );

    if (!membership) {
      throw new ForbiddenError('User is not a member of this company');
    }

    await this.userRepository.updateActiveCompany(input.userId, input.companyId);

    return { success: true };
  }

  async getById(input: GetCompanyInput): Promise<GetCompanyOutput> {
    const company = await this.companyRepository.findByIdForUser(
      input.companyId,
      input.userId
    );

    return {
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        createdAt: company.createdAt,
      },
    };
  }
}


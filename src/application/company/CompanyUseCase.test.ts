import { describe, it, expect, beforeEach } from '@jest/globals';
import { CompanyUseCase } from './CompanyUseCase';
import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Role } from '../../domain/enums/Role';

describe('CompanyUseCase', () => {
  let companyUseCase: CompanyUseCase;
  let mockCompanyRepository: ICompanyRepository;
  let mockMembershipRepository: IMembershipRepository;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockCompanyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByIdWithMembers: jest.fn(),
      findByIdForUser: jest.fn(),
      findByIdWithMembersForUser: jest.fn(),
    };

    mockMembershipRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserAndCompany: jest.fn(),
      findByCompanyId: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateActiveCompany: jest.fn(),
      findByIdWithMemberships: jest.fn(),
    };

    companyUseCase = new CompanyUseCase(
      mockCompanyRepository,
      mockMembershipRepository,
      mockUserRepository
    );
  });

  it('should create a company and membership with OWNER role', async () => {
    const input = {
      name: 'Test Company',
      logo: 'https://example.com/logo.png',
      userId: 'user-id',
    };

    const mockCompany = {
      id: 'company-id',
      name: input.name,
      logo: input.logo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockCompanyRepository.create as jest.Mock).mockResolvedValue(mockCompany);
    (mockMembershipRepository.create as jest.Mock).mockResolvedValue({
      id: 'membership-id',
      userId: input.userId,
      companyId: mockCompany.id,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await companyUseCase.create(input);

    expect(result.company.name).toBe(input.name);
    expect(mockCompanyRepository.create).toHaveBeenCalledWith({
      name: input.name,
      logo: input.logo,
    });
    expect(mockMembershipRepository.create).toHaveBeenCalledWith({
      userId: input.userId,
      companyId: mockCompany.id,
      role: Role.OWNER,
    });
  });

  it('should list companies for a user', async () => {
    const input = {
      userId: 'user-id',
      page: 1,
      limit: 10,
    };

    const mockCompanies = [
      {
        id: 'company-1',
        name: 'Company 1',
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'company-2',
        name: 'Company 2',
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockCompanyRepository.findByUserId as jest.Mock).mockResolvedValue(mockCompanies);

    const result = await companyUseCase.list(input);

    expect(result.companies).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
  });

  it('should select a company', async () => {
    const input = {
      userId: 'user-id',
      companyId: 'company-id',
    };

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue({
      id: 'membership-id',
      userId: input.userId,
      companyId: input.companyId,
      role: Role.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.updateActiveCompany as jest.Mock).mockResolvedValue({
      id: input.userId,
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test',
      activeCompanyId: input.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await companyUseCase.select(input);

    expect(result.success).toBe(true);
    expect(mockUserRepository.updateActiveCompany).toHaveBeenCalledWith(
      input.userId,
      input.companyId
    );
  });

  it('should paginate companies correctly', async () => {
    const mockCompanies = Array.from({ length: 25 }, (_, i) => ({
      id: `company-${i + 1}`,
      name: `Company ${i + 1}`,
      logo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    (mockCompanyRepository.findByUserId as jest.Mock).mockResolvedValue(mockCompanies);

    // Test page 1 with limit 10
    const result1 = await companyUseCase.list({
      userId: 'user-id',
      page: 1,
      limit: 10,
    });

    expect(result1.companies).toHaveLength(10);
    expect(result1.total).toBe(25);
    expect(result1.page).toBe(1);
    expect(result1.limit).toBe(10);
    expect(result1.companies[0].id).toBe('company-1');
    expect(result1.companies[9].id).toBe('company-10');

    // Test page 2 with limit 10
    const result2 = await companyUseCase.list({
      userId: 'user-id',
      page: 2,
      limit: 10,
    });

    expect(result2.companies).toHaveLength(10);
    expect(result2.page).toBe(2);
    expect(result2.companies[0].id).toBe('company-11');
    expect(result2.companies[9].id).toBe('company-20');

    // Test page 3 with limit 10 (should have 5 items)
    const result3 = await companyUseCase.list({
      userId: 'user-id',
      page: 3,
      limit: 10,
    });

    expect(result3.companies).toHaveLength(5);
    expect(result3.page).toBe(3);
    expect(result3.companies[0].id).toBe('company-21');
    expect(result3.companies[4].id).toBe('company-25');
  });

  it('should throw error when user tries to select company without being a member', async () => {
    const input = {
      userId: 'user-id',
      companyId: 'company-id',
    };

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue(null);

    await expect(companyUseCase.select(input)).rejects.toThrow(
      'User is not a member of this company'
    );
    expect(mockUserRepository.updateActiveCompany).not.toHaveBeenCalled();
  });
});


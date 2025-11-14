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

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test',
      activeCompanyId: 'company-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCompany = {
      id: 'company-1',
      name: 'Company 1',
      logo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMembership = {
      id: 'membership-id',
      userId: 'user-id',
      companyId: 'company-1',
      role: Role.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue(mockMembership);
    (mockCompanyRepository.findById as jest.Mock).mockResolvedValue(mockCompany);

    const result = await companyUseCase.list(input);

    expect(result.companies).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.companies[0].id).toBe('company-1');
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

  it('should return empty list when user has no active company', async () => {
    const input = {
      userId: 'user-id',
      page: 1,
      limit: 10,
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test',
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await companyUseCase.list(input);

    expect(result.companies).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should return empty list when user membership is not found', async () => {
    const input = {
      userId: 'user-id',
      page: 1,
      limit: 10,
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test',
      activeCompanyId: 'company-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue(null);

    const result = await companyUseCase.list(input);

    expect(result.companies).toHaveLength(0);
    expect(result.total).toBe(0);
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


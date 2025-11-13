import { describe, it, expect, beforeEach } from '@jest/globals';
import { MembershipUseCase } from './MembershipUseCase';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Role } from '../../domain/enums/Role';

describe('MembershipUseCase', () => {
  let membershipUseCase: MembershipUseCase;
  let mockMembershipRepository: IMembershipRepository;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
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

    membershipUseCase = new MembershipUseCase(mockMembershipRepository, mockUserRepository);
  });

  it('should prevent company from having no OWNER', async () => {
    const input = {
      membershipId: 'owner-membership-id',
      removedBy: 'owner-id',
      companyId: 'company-id',
    };

    // Only one owner in the company
    const allMemberships = [
      {
        id: 'owner-membership-id',
        userId: 'owner-id',
        companyId: input.companyId,
        role: Role.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue({
      id: 'owner-membership-id',
      userId: input.removedBy,
      companyId: input.companyId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findById as jest.Mock).mockResolvedValue({
      id: 'owner-membership-id',
      userId: 'owner-id',
      companyId: input.companyId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findByCompanyId as jest.Mock).mockResolvedValue(allMemberships);

    await expect(membershipUseCase.removeMember(input)).rejects.toThrow(
      'Company must have at least one owner'
    );
    expect(mockMembershipRepository.delete).not.toHaveBeenCalled();
  });

  it('should prevent ADMIN from removing OWNER', async () => {
    const input = {
      membershipId: 'owner-membership-id',
      removedBy: 'admin-id',
      companyId: 'company-id',
    };

    const allMemberships = [
      {
        id: 'owner-membership-id',
        userId: 'owner-id',
        companyId: input.companyId,
        role: Role.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'admin-membership-id',
        userId: input.removedBy,
        companyId: input.companyId,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue({
      id: 'admin-membership-id',
      userId: input.removedBy,
      companyId: input.companyId,
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findById as jest.Mock).mockResolvedValue({
      id: 'owner-membership-id',
      userId: 'owner-id',
      companyId: input.companyId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findByCompanyId as jest.Mock).mockResolvedValue(allMemberships);

    await expect(membershipUseCase.removeMember(input)).rejects.toThrow(
      'Admins cannot remove owners'
    );
    expect(mockMembershipRepository.delete).not.toHaveBeenCalled();
  });

  it('should clear activeCompanyId when user is removed from company', async () => {
    const input = {
      membershipId: 'member-membership-id',
      removedBy: 'admin-id',
      companyId: 'company-id',
    };

    const allMemberships = [
      {
        id: 'owner-membership-id',
        userId: 'owner-id',
        companyId: input.companyId,
        role: Role.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'admin-membership-id',
        userId: input.removedBy,
        companyId: input.companyId,
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'member-membership-id',
        userId: 'member-id',
        companyId: input.companyId,
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue({
      id: 'admin-membership-id',
      userId: input.removedBy,
      companyId: input.companyId,
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findById as jest.Mock).mockResolvedValue({
      id: input.membershipId,
      userId: 'member-id',
      companyId: input.companyId,
      role: Role.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findByCompanyId as jest.Mock).mockResolvedValue(allMemberships);

    (mockUserRepository.findById as jest.Mock).mockResolvedValue({
      id: 'member-id',
      email: 'member@example.com',
      password: 'hashed',
      name: 'Member',
      activeCompanyId: input.companyId, // User has this company as active
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.updateActiveCompany as jest.Mock).mockResolvedValue({
      id: 'member-id',
      email: 'member@example.com',
      password: 'hashed',
      name: 'Member',
      activeCompanyId: null, // Cleared
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await membershipUseCase.removeMember(input);

    expect(result.success).toBe(true);
    expect(mockMembershipRepository.delete).toHaveBeenCalledWith('member-membership-id');
    expect(mockUserRepository.updateActiveCompany).toHaveBeenCalledWith('member-id', null);
  });

  it('should allow OWNER to remove another OWNER if there are multiple owners', async () => {
    const input = {
      membershipId: 'owner2-membership-id',
      removedBy: 'owner1-id',
      companyId: 'company-id',
    };

    const allMemberships = [
      {
        id: 'owner1-membership-id',
        userId: input.removedBy,
        companyId: input.companyId,
        role: Role.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'owner2-membership-id',
        userId: 'owner2-id',
        companyId: input.companyId,
        role: Role.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockMembershipRepository.findByUserAndCompany as jest.Mock).mockResolvedValue({
      id: 'owner1-membership-id',
      userId: input.removedBy,
      companyId: input.companyId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findById as jest.Mock).mockResolvedValue({
      id: 'owner2-membership-id',
      userId: 'owner2-id',
      companyId: input.companyId,
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockMembershipRepository.findByCompanyId as jest.Mock).mockResolvedValue(allMemberships);

    (mockUserRepository.findById as jest.Mock).mockResolvedValue({
      id: 'owner2-id',
      email: 'owner2@example.com',
      password: 'hashed',
      name: 'Owner 2',
      activeCompanyId: input.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (mockUserRepository.updateActiveCompany as jest.Mock).mockResolvedValue({
      id: 'owner2-id',
      email: 'owner2@example.com',
      password: 'hashed',
      name: 'Owner 2',
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await membershipUseCase.removeMember(input);

    expect(result.success).toBe(true);
    expect(mockMembershipRepository.delete).toHaveBeenCalledWith('owner2-membership-id');
  });
});


import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserRepository } from './UserRepository';
import { prisma } from '../database/prisma';

jest.mock('../database/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashed_password',
      name: 'Test User',
    };

    const mockUser = {
      id: 'user-id',
      ...userData,
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.create(userData);

    expect(result.email).toBe(userData.email);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
  });

  it('should find user by email', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed',
      name: 'Test',
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findByEmail('test@example.com');

    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
  });
});

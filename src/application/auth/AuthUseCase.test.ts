import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthUseCase } from './AuthUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateActiveCompany: jest.fn(),
      findByIdWithMemberships: jest.fn(),
    };

    authUseCase = new AuthUseCase(mockUserRepository);
  });

  it('should create a new user successfully', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (mockUserRepository.create as jest.Mock).mockResolvedValue({
      id: 'user-id',
      email: input.email,
      password: 'hashed_password',
      name: input.name,
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authUseCase.signUp(input);

    expect(result.user.email).toBe(input.email);
    expect(result.user.name).toBe(input.name);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: input.email,
      password: 'hashed_password',
      name: input.name,
    });
  });

  it('should throw error if user already exists', async () => {
    const input = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Test User',
    };

    (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue({
      id: 'existing-id',
      email: input.email,
      password: 'hashed',
      name: 'Existing',
      activeCompanyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(authUseCase.signUp(input)).rejects.toThrow('User already exists');
  });
});


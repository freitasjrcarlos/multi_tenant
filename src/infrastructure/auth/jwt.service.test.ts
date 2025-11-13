import { describe, it, expect, beforeEach } from '@jest/globals';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    jwtService = new JwtService();
  });

  it('should generate a token', () => {
    const payload = {
      userId: 'user-id',
      email: 'test@example.com',
      activeCompanyId: 'company-id',
    };

    const token = jwtService.generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const payload = {
      userId: 'user-id',
      email: 'test@example.com',
      activeCompanyId: 'company-id',
    };

    const token = jwtService.generateToken(payload);
    const verified = jwtService.verifyToken(token);

    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
  });

  it('should throw error for invalid token', () => {
    expect(() => {
      jwtService.verifyToken('invalid-token');
    }).toThrow('Invalid token');
  });
});

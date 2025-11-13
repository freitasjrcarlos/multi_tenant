import bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { ConflictError, UnauthorizedError } from '../../domain/errors/AppError';

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

export interface SignUpOutput {
  user: {
    id: string;
    email: string;
    name: string;
    activeCompanyId: string | null;
  };
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
    activeCompanyId: string | null;
  };
  token: string;
}

export class AuthUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async signUp(input: SignUpInput): Promise<SignUpOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeCompanyId: user.activeCompanyId,
      },
      token: '', // Token será gerado no controller
    };
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeCompanyId: user.activeCompanyId,
      },
      token: '', // Token será gerado no controller
    };
  }
}


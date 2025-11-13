import bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

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

export class AuthUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async signUp(input: SignUpInput): Promise<SignUpOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
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
}


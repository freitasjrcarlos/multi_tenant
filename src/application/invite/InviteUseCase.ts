import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { IInviteRepository } from '../../domain/repositories/IInviteRepository';
import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { InviteRepository } from '../../infrastructure/repositories/InviteRepository';
import { MembershipRepository } from '../../infrastructure/repositories/MembershipRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Role } from '../../domain/enums/Role';

export interface CreateInviteInput {
  email: string;
  companyId: string;
  invitedBy: string;
  role?: Role;
}

export interface CreateInviteOutput {
  invite: {
    id: string;
    email: string;
    token: string;
    role: Role;
    expiresAt: Date;
  };
}

export interface AcceptInviteInput {
  token: string;
  password: string;
  name: string;
}

export interface AcceptInviteOutput {
  user: {
    id: string;
    email: string;
    name: string;
    activeCompanyId: string;
  };
  token: string;
}

export class InviteUseCase {
  private inviteRepository: IInviteRepository;
  private membershipRepository: IMembershipRepository;
  private userRepository: IUserRepository;

  constructor(
    inviteRepository?: IInviteRepository,
    membershipRepository?: IMembershipRepository,
    userRepository?: IUserRepository
  ) {
    this.inviteRepository = inviteRepository || new InviteRepository();
    this.membershipRepository = membershipRepository || new MembershipRepository();
    this.userRepository = userRepository || new UserRepository();
  }

  async create(input: CreateInviteInput): Promise<CreateInviteOutput> {
    const membership = await this.membershipRepository.findByUserAndCompany(
      input.invitedBy,
      input.companyId
    );

    if (!membership) {
      throw new Error('User is not a member of this company');
    }

    if (membership.role === Role.MEMBER) {
      throw new Error('Members cannot invite others');
    }

    if (input.role === Role.OWNER && membership.role !== Role.OWNER) {
      throw new Error('Only owners can invite other owners');
    }

    const existingInvite = await this.inviteRepository.findByEmailAndCompany(
      input.email,
      input.companyId
    );

    if (existingInvite) {
      throw new Error('Invite already exists for this email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invite = await this.inviteRepository.create({
      email: input.email,
      companyId: input.companyId,
      token,
      role: input.role || Role.MEMBER,
      invitedBy: input.invitedBy,
      expiresAt,
    });

    return {
      invite: {
        id: invite.id,
        email: invite.email,
        token: invite.token,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    };
  }

  async accept(input: AcceptInviteInput): Promise<AcceptInviteOutput> {
    const invite = await this.inviteRepository.findByToken(input.token);

    if (!invite) {
      throw new Error('Invalid invite token');
    }

    if (invite.accepted) {
      throw new Error('Invite already accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new Error('Invite has expired');
    }

    let user = await this.userRepository.findByEmail(invite.email);

    if (user) {
      const existingMembership = await this.membershipRepository.findByUserAndCompany(
        user.id,
        invite.companyId
      );

      if (existingMembership) {
        throw new Error('User is already a member of this company');
      }
    } else {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      user = await this.userRepository.create({
        email: invite.email,
        password: hashedPassword,
        name: input.name,
      });
    }

    await this.membershipRepository.create({
      userId: user.id,
      companyId: invite.companyId,
      role: invite.role,
    });

    await this.userRepository.updateActiveCompany(user.id, invite.companyId);
    await this.inviteRepository.updateAccepted(invite.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeCompanyId: invite.companyId,
      },
      token: '', // Token será gerado no controller
    };
  }
}


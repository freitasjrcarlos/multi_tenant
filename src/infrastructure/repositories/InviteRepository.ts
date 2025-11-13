import { PrismaClient, Invite as PrismaInvite, Role as PrismaRole } from '@prisma/client';
import { IInviteRepository } from '../../domain/repositories/IInviteRepository';
import { Invite } from '../../domain/entities/Invite';
import { Role } from '../../domain/enums/Role';
import { prisma } from '../database/prisma';

export class InviteRepository implements IInviteRepository {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  async create(data: {
    email: string;
    companyId: string;
    token: string;
    role: PrismaRole;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<Invite> {
    const invite = await this.client.invite.create({
      data,
    });
    return this.toDomain(invite);
  }

  async findByToken(token: string): Promise<Invite | null> {
    const invite = await this.client.invite.findUnique({
      where: { token },
    });
    return invite ? this.toDomain(invite) : null;
  }

  async findByEmailAndCompany(email: string, companyId: string): Promise<Invite | null> {
    const invite = await this.client.invite.findFirst({
      where: {
        email,
        companyId,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return invite ? this.toDomain(invite) : null;
  }

  async updateAccepted(id: string): Promise<Invite> {
    const invite = await this.client.invite.update({
      where: { id },
      data: { accepted: true },
    });
    return this.toDomain(invite);
  }

  async delete(id: string): Promise<void> {
    await this.client.invite.delete({
      where: { id },
    });
  }

  private toDomain(invite: PrismaInvite): Invite {
    return {
      id: invite.id,
      email: invite.email,
      companyId: invite.companyId,
      token: invite.token,
      role: invite.role as unknown as Role,
      invitedBy: invite.invitedBy,
      accepted: invite.accepted,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
    };
  }
}


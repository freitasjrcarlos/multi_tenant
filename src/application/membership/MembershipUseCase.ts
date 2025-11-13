import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MembershipRepository } from '../../infrastructure/repositories/MembershipRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Role } from '../../domain/enums/Role';

export interface RemoveMemberInput {
  membershipId: string;
  removedBy: string;
  companyId: string;
}

export interface RemoveMemberOutput {
  success: boolean;
}

export class MembershipUseCase {
  private membershipRepository: IMembershipRepository;
  private userRepository: IUserRepository;

  constructor(
    membershipRepository?: IMembershipRepository,
    userRepository?: IUserRepository
  ) {
    this.membershipRepository = membershipRepository || new MembershipRepository();
    this.userRepository = userRepository || new UserRepository();
  }

  async removeMember(input: RemoveMemberInput): Promise<RemoveMemberOutput> {
    const removerMembership = await this.membershipRepository.findByUserAndCompany(
      input.removedBy,
      input.companyId
    );

    if (!removerMembership) {
      throw new Error('User is not a member of this company');
    }

    // Find the membership to remove
    const membershipToRemove = await this.membershipRepository.findById(input.membershipId);
    if (!membershipToRemove) {
      throw new Error('Membership not found');
    }

    if (membershipToRemove.companyId !== input.companyId) {
      throw new Error('Membership does not belong to this company');
    }

    // ADMIN cannot remove OWNER (check this first)
    if (removerMembership.role === Role.ADMIN && membershipToRemove.role === Role.OWNER) {
      throw new Error('Admins cannot remove owners');
    }

    // Find all memberships to check if removing would leave company without OWNER
    const allMemberships = await this.membershipRepository.findByCompanyId(input.companyId);
    const ownerCount = allMemberships.filter((m) => m.role === Role.OWNER).length;

    // Check if trying to remove OWNER
    if (membershipToRemove.role === Role.OWNER) {
      // Only OWNER can remove another OWNER, but only if there's at least one other OWNER
      if (removerMembership.role !== Role.OWNER) {
        throw new Error('Only owners can remove other owners');
      }

      if (ownerCount <= 1) {
        throw new Error('Company must have at least one owner');
      }
    }

    // Remove the membership
    await this.membershipRepository.delete(input.membershipId);

    // Clear activeCompanyId if it was set to this company
    const user = await this.userRepository.findById(membershipToRemove.userId);
    if (user && user.activeCompanyId === input.companyId) {
      await this.userRepository.updateActiveCompany(membershipToRemove.userId, null);
    }

    return { success: true };
  }
}


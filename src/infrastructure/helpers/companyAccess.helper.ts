import { IMembershipRepository } from '../../domain/repositories/IMembershipRepository';
import { MembershipRepository } from '../repositories/MembershipRepository';
import { ForbiddenError } from '../../domain/errors/AppError';

export async function validateCompanyAccess(
  userId: string,
  companyId: string,
  membershipRepository?: IMembershipRepository
): Promise<void> {
  const membershipRepo = membershipRepository || new MembershipRepository();
  
  const membership = await membershipRepo.findByUserAndCompany(userId, companyId);
  
  if (!membership) {
    throw new ForbiddenError('User does not have access to this company');
  }
}

export async function getMembershipForCompany(
  userId: string,
  companyId: string,
  membershipRepository?: IMembershipRepository
) {
  const membershipRepo = membershipRepository || new MembershipRepository();
  
  const membership = await membershipRepo.findByUserAndCompany(userId, companyId);
  
  if (!membership) {
    throw new ForbiddenError('User does not have access to this company');
  }
  
  return membership;
}


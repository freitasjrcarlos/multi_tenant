export interface Company {
  id: string;
  name: string;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyWithMembers extends Company {
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}


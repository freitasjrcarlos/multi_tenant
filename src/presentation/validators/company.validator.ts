import { z } from 'zod';

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    logo: z.string().url('Invalid logo URL').optional(),
  }),
});

export const listCompaniesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const selectCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid company ID'),
  }),
});

export const getCompanySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid company ID'),
  }),
});

export const inviteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid company ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).optional(),
  }),
});


import { z } from "zod";

/**
 * Validation schemas for company endpoints
 */

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).describe("Company name"),
    description: z.string().max(500).optional().describe("Company description"),
    industry: z.string().optional().describe("Industry type"),
    employeeCount: z.number().min(1).optional().describe("Employee count"),
  }),
});

export const updateCompanySettingsSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    website: z.string().url().optional(),
    logo: z.string().url().optional(),
    customBranding: z.object({
      primaryColor: z.string().optional(),
      logoUrl: z.string().optional(),
    }).optional(),
    settings: z.object({
      twoFactorRequired: z.boolean().optional(),
      dataExportAllowed: z.boolean().optional(),
      apiAccessAllowed: z.boolean().optional(),
    }).optional(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().describe("User ID to add to company"),
  }),
});

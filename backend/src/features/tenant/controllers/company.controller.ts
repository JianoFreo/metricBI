import { Request, Response } from "express";
import { CompanyService } from "../services/company.service.js";
import { asyncHandler } from "@common/utils/asyncHandler.js";
import { sendSuccess, sendPaginated } from "@common/utils/response.js";

const service = new CompanyService();

/**
 * Create a new company (tenant)
 * Only owner can do this - typically during signup
 */
export const createCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, industry, employeeCount } = req.body;

    const company = await service.createCompany(
      {
        name,
        description,
        industry,
        employeeCount,
      },
      req.user!.userId
    );

    sendSuccess(res, company, 201);
  }
);

/**
 * Get authenticated user's company details
 */
export const getCompanyDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const company = await service.getCompanyDetails(req.companyId!);
    sendSuccess(res, company, 200);
  }
);

/**
 * Update company settings
 */
export const updateCompanySettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, website, logo, customBranding, settings } =
      req.body;

    const company = await service.updateCompanySettings(
      req.companyId!,
      {
        name,
        description,
        website,
        logo,
        customBranding,
        settings,
      },
      req.user!.role as any
    );

    sendSuccess(res, company, 200);
  }
);

/**
 * Get all members in company
 */
export const getCompanyMembers = asyncHandler(
  async (req: Request, res: Response) => {
    const members = await service.getCompanyMembers(req.companyId!);
    sendSuccess(res, members, 200);
  }
);

/**
 * Add member to company
 */
export const addMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const company = await service.addMemberToCompany(
      req.companyId!,
      userId,
      req.user!.role as any
    );

    sendSuccess(res, company, 201);
  }
);

/**
 * Remove member from company
 */
export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    await service.removeMemberFromCompany(
      req.companyId!,
      userId,
      req.user!.role as any,
      req.user!.userId
    );

    sendSuccess(res, { message: "Member removed successfully" }, 200);
  }
);

/**
 * Get subscription information
 */
export const getSubscriptionInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const subscription = await service.getSubscriptionInfo(req.companyId!);
    sendSuccess(res, subscription, 200);
  }
);

/**
 * Delete company (soft delete)
 */
export const deleteCompany = asyncHandler(
  async (req: Request, res: Response) => {
    await service.deleteCompany(req.companyId!, req.user!.role as any);
    sendSuccess(res, { message: "Company deleted successfully" }, 200);
  }
);

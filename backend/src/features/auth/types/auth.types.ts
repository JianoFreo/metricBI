/**
 * Authentication-related type definitions
 */

export type AuthRole = "viewer" | "analyst" | "manager" | "admin" | "super_admin";

export interface JwtPayload {
  userId: string;
  email: string;
  companyId: string;
  role: AuthRole;
  firstName: string;
  lastName: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  refreshTokenHash?: string | null;
  role: AuthRole;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  user: Omit<IUser, "password" | "refreshTokenHash">;
  tokens: TokenPair;
}

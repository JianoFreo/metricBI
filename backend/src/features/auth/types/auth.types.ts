/**
 * Authentication-related type definitions
 */

export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin" | "seller";
  tenantId?: string;
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
  role: "user" | "admin" | "seller";
  tenantId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthResponse {
  user: Omit<IUser, "password">;
  tokens: TokenPair;
}

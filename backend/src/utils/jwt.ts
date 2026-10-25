import jwt from "jsonwebtoken";

export type Role = "admin" | "teacher" | "student";

export interface AccessTokenPayload {
  sub: number;
  role: Role;
  email: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(payload: { sub: number }): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: number } {
  return jwt.verify(token, REFRESH_SECRET) as unknown as { sub: number };
}

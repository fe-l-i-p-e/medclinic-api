import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../entities/user.entity";

export interface TokenPayload {
  id: number;
  roles: UserRole[];
}

export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.secret) as TokenPayload;
}

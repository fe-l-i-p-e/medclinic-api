import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    throw new AppError("NAO_AUTENTICADO", 401, "Token de autenticação não informado.");

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token)
    throw new AppError("NAO_AUTENTICADO", 401, "Formato de token inválido.");

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, roles: payload.roles };
    return next();
  } catch {
    throw new AppError("NAO_AUTENTICADO", 401, "Token inválido ou expirado.");
  }
}

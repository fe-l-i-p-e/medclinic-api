import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token de autenticação não informado.", 401);
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Formato de token inválido.", 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (error) {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}   
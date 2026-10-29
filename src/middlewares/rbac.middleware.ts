import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/user.entity";
import { AppError } from "../utils/app-error";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError("NAO_AUTENTICADO", 401, "Não autenticado.");

    const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasPermission)
      throw new AppError("ACESSO_NEGADO", 403, "Sem permissão para este recurso.");

    return next();
  };
}

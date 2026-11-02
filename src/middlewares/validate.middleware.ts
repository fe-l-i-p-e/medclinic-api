import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/app-error";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) throw new AppError("DADOS_INVALIDOS", 400, "Dados de entrada inválidos.");
    req.body = result.data;
    return next();
  };
}

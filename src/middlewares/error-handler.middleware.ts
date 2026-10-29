import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ statusCode: error.statusCode, error: error.code, message: error.message });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      statusCode: 400,
      error: "DADOS_INVALIDOS",
      message: "Corpo da requisição em formato inválido.",
    });
  }

  console.error(error);
  return res
    .status(500)
    .json({ statusCode: 500, error: "ERRO_INTERNO", message: "Erro interno do servidor." });
}

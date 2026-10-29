import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../entities/user.entity";

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.get("/me", authMiddleware, controller.me);
  // não existe cadastro público: só um admin autenticado cria usuários
  router.post("/", authMiddleware, authorize(UserRole.ADMIN), controller.create);
  return router;
}

import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../entities/user.entity";

export function createPatientRoutes(controller: PatientController): Router {
  const router = Router();
  router.use(authMiddleware);
  router.post("/", authorize(UserRole.ADMIN, UserRole.SECRETARY), controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", authorize(UserRole.ADMIN, UserRole.SECRETARY), controller.update);
  router.delete("/:id", authorize(UserRole.ADMIN), controller.remove);
  return router;
}

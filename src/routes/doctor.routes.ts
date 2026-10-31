import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../entities/user.entity";

export function createDoctorRoutes(controller: DoctorController): Router {
  const router = Router();
  router.use(authMiddleware);
  router.post("/", authorize(UserRole.ADMIN), controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  return router;
}

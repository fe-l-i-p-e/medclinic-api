import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../entities/user.entity";

export function createAppointmentRoutes(controller: AppointmentController): Router {
  const router = Router();
  router.use(authMiddleware);
  router.post("/", authorize(UserRole.ADMIN, UserRole.SECRETARY), controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  // a autorização fina depende da transição e é feita dentro do service
  router.patch("/:id/status", controller.updateStatus);
  return router;
}

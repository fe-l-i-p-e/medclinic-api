import { Router } from "express";
import { MedicalRecordController } from "../controllers/medical-record.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../entities/user.entity";

// montado em /patients/:patientId/medical-records
export function createMedicalRecordRoutes(controller: MedicalRecordController): Router {
  const router = Router({ mergeParams: true });
  router.use(authMiddleware);
  router.post("/", authorize(UserRole.DOCTOR), controller.create);
  router.get("/", authorize(UserRole.DOCTOR, UserRole.ADMIN), controller.list);
  return router;
}

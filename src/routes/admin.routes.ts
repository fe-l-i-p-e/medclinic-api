import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { authorize } from "../middlewares/rbacMiddleware";
import { UserRole } from "../entities/User";

const router = Router();

router.get("/ping", authMiddleware, authorize(UserRole.ADMIN), (req, res) => {
  return res.status(200).json({
    message: "Acesso autorizado: você é Administrador.",
    user: req.user,
  });
});

export default router;
import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const router = Router();
const userController = new UserController();

router.get("/me", authMiddleware, userController.me);

export default router;
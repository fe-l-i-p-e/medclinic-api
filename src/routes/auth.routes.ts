import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";

const router = Router();
const authController = new AuthController();
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", authController.login);

export default router;
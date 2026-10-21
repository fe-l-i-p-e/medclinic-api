import { Router } from "express";
import { Controllers } from "../container";
import { createHealthRoutes } from "./health.routes";
import { createAuthRoutes } from "./auth.routes";
import { createUserRoutes } from "./user.routes";

export function createRoutes(c: Controllers): Router {
  const router = Router();
  router.use("/health", createHealthRoutes());
  router.use("/auth", createAuthRoutes(c.auth));
  router.use("/users", createUserRoutes(c.user));
  return router;
}

import { Router } from "express";

export function createHealthRoutes(): Router {
  const router = Router();
  router.get("/", (req, res) => res.status(200).json({ status: "ok" }));
  return router;
}

import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { Controllers } from "./container";
import { createRoutes } from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

export function createApp(controllers: Controllers): Application {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/v1", createRoutes(controllers));
  app.use(errorHandler);
  return app;
}

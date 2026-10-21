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
  app.use((req, res) => {
    res.status(404).json({
      statusCode: 404,
      error: "RECURSO_NAO_ENCONTRADO",
      message: "Rota não encontrada.",
    });
  });
  app.use(errorHandler);
  return app;
}

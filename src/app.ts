import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(routes);
  app.use(errorHandler);

  return app;
}
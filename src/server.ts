import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import { buildContainer } from "./container";
import { createApp } from "./app";
import { env } from "./config/env";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("Conexão com o PostgreSQL estabelecida.");

    const app = createApp(buildContainer(AppDataSource));
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`MedClinic API rodando na porta ${env.port}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar a aplicação:", error);
    process.exit(1);
  }
}

void bootstrap();

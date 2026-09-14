import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import { createApp } from "./app";
import { env } from "./config/env";

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log("Conexão com o PostgreSQL estabelecida.");

    const app = createApp();

    app.listen(env.port, () => {
      console.log(`MedClinic API rodando em http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Falha ao iniciar a aplicação:", error);
    process.exit(1);
  }
}

bootstrap();
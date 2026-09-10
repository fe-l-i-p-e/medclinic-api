import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env"
import { User } from "../entities/User"

export const AppDataSource = new DataSource ({
    type: "postgres",
    host: env.db.host,
    port: env.db.port,
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    synchronize: true, 
    logging: false,
    entities: [User],
    migrations: [],

})

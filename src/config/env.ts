import { config } from "dotenv";

config();

export const env = { 
    port: Number(process.env.PORT) || 3000,
    db: {
        host: process.env.DB_HOST as string,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
        database: process.env.DB_DATABASE as string,
    },
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
}
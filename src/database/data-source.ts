import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env";
import { User } from "../entities/user.entity";
import { Appointment } from "../entities/appointment.entity";
import { WorkScheduleShift } from "../entities/work-schedule-shift.entity";
import { Doctor } from "../entities/doctor.entity";
import { Patient } from "../entities/patient.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  entities: [User, Patient, Doctor, WorkScheduleShift, Appointment],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
});

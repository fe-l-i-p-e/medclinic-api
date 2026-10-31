import { DataSource } from "typeorm";
import { UserRepository } from "./repositories/user.repository";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { DoctorRepository } from "./repositories/doctor.repository";
import { DoctorService } from "./services/doctor.service";
import { DoctorController } from "./controllers/doctor.controller";
import { PatientRepository } from "./repositories/patient.repository";
import { PatientService } from "./services/patient.service";
import { PatientController } from "./controllers/patient.controller";

export interface Controllers {
  auth: AuthController;
  user: UserController;
  doctor: DoctorController;
  patient: PatientController;
}

// Composition root: único lugar onde as dependências são instanciadas.
export function buildContainer(dataSource: DataSource): Controllers {
  const userRepository = new UserRepository(dataSource);
  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);

  const patientRepository = new PatientRepository(dataSource);
  const patientService = new PatientService(patientRepository);

  const doctorRepository = new DoctorRepository(dataSource);
  const doctorService = new DoctorService(doctorRepository, userRepository, dataSource);

  return {
    auth: new AuthController(authService),
    user: new UserController(userService),
    doctor: new DoctorController(doctorService),
    patient: new PatientController(patientService),
  };
}

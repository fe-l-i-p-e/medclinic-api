import { DataSource } from "typeorm";
import { UserRepository } from "./repositories/user.repository";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { PatientRepository } from "./repositories/patient.repository";
import { PatientService } from "./services/patient.service";
import { PatientController } from "./controllers/patient.controller";

export interface Controllers {
  auth: AuthController;
  user: UserController;
  patient: PatientController;
}

// Composition root: único lugar onde as dependências são instanciadas.
export function buildContainer(dataSource: DataSource): Controllers {
  const userRepository = new UserRepository(dataSource);
  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);

  const patientRepository = new PatientRepository(dataSource);
  const patientService = new PatientService(patientRepository);

  return {
    auth: new AuthController(authService),
    user: new UserController(userService),
    patient: new PatientController(patientService),
  };
}

import { DataSource } from "typeorm";
import { UserRepository } from "./repositories/user.repository";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { AppointmentRepository } from "./repositories/appointment.repository";
import { AppointmentService } from "./services/appointment.service";
import { AppointmentStatusService } from "./services/appointment-status.service";
import { AppointmentController } from "./controllers/appointment.controller";
import { WorkScheduleRepository } from "./repositories/work-schedule.repository";
import { WorkScheduleService } from "./services/work-schedule.service";
import { DoctorRepository } from "./repositories/doctor.repository";
import { DoctorService } from "./services/doctor.service";
import { DoctorController } from "./controllers/doctor.controller";
import { PatientRepository } from "./repositories/patient.repository";
import { PatientService } from "./services/patient.service";
import { PatientController } from "./controllers/patient.controller";

export interface Controllers {
  auth: AuthController;
  user: UserController;
  appointment: AppointmentController;
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

  const workScheduleRepository = new WorkScheduleRepository(dataSource);
  const workScheduleService = new WorkScheduleService(doctorRepository, workScheduleRepository);

  const appointmentRepository = new AppointmentRepository(dataSource);
  const appointmentService = new AppointmentService(
    doctorRepository,
    patientRepository,
    appointmentRepository,
    workScheduleRepository,
    dataSource
  );
  const appointmentStatusService = new AppointmentStatusService(
    appointmentRepository,
    doctorRepository
  );

  return {
    auth: new AuthController(authService),
    user: new UserController(userService),
    appointment: new AppointmentController(appointmentService, appointmentStatusService),
    doctor: new DoctorController(doctorService, workScheduleService, appointmentService),
    patient: new PatientController(patientService),
  };
}

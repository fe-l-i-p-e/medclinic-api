import { PatientRepository } from "../repositories/patient.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { CreateMedicalRecordDTO } from "../dtos/medical-record/create-medical-record.dto";
import {
  toMedicalRecordResponseDTO,
  MedicalRecordResponseDTO,
} from "../dtos/medical-record/medical-record-response.dto";
import { AppError } from "../utils/app-error";
import { AppointmentStatus } from "../entities/appointment.entity";
import { UserRole } from "../entities/user.entity";

interface AuthenticatedUser {
  id: number;
  roles: UserRole[];
}

export class MedicalRecordService {
  constructor(
    private patientRepository: PatientRepository,
    private doctorRepository: DoctorRepository,
    private appointmentRepository: AppointmentRepository,
    private medicalRecordRepository: MedicalRecordRepository
  ) {}

  private async hasBond(doctorId: number, patientId: number): Promise<boolean> {
    const count = await this.appointmentRepository.countByDoctorPatientAndStatus(
      doctorId,
      patientId,
      [AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE]
    );
    return count > 0;
  }

  async create(
    patientId: number,
    data: CreateMedicalRecordDTO,
    user: AuthenticatedUser
  ): Promise<MedicalRecordResponseDTO> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");

    if (!data.text?.trim())
      throw new AppError("DADOS_INVALIDOS", 400, "Texto do prontuário é obrigatório.");

    const doctor = await this.doctorRepository.findByUserId(user.id);
    if (!doctor) throw new AppError("ACESSO_NEGADO", 403, "Usuário não é médico.");

    const bonded = await this.hasBond(doctor.id, patientId);
    if (!bonded) throw new AppError("ACESSO_NEGADO", 403, "Sem vínculo com este paciente.");

    const record = await this.medicalRecordRepository.create({
      patientId,
      doctorId: doctor.id,
      text: data.text,
    });
    return toMedicalRecordResponseDTO(record);
  }

  async listByPatient(
    patientId: number,
    user: AuthenticatedUser
  ): Promise<MedicalRecordResponseDTO[]> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");

    if (!user.roles.includes(UserRole.ADMIN)) {
      const doctor = await this.doctorRepository.findByUserId(user.id);
      if (!doctor) throw new AppError("ACESSO_NEGADO", 403, "Sem acesso ao prontuário.");
      const bonded = await this.hasBond(doctor.id, patientId);
      if (!bonded) throw new AppError("ACESSO_NEGADO", 403, "Sem vínculo com este paciente.");
    }

    const records = await this.medicalRecordRepository.findByPatient(patientId);
    return records.map(toMedicalRecordResponseDTO);
  }
}

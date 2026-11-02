import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { AppointmentStatus } from "../entities/appointment.entity";
import { AppError } from "../utils/app-error";
import { UserRole } from "../entities/user.entity";
import {
  toAppointmentResponseDTO,
  AppointmentResponseDTO,
} from "../dtos/appointment/appointment-response.dto";

interface AuthenticatedUser {
  id: number;
  roles: UserRole[];
}

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.SCHEDULED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.DONE, AppointmentStatus.CANCELLED],
  [AppointmentStatus.DONE]: [],
  [AppointmentStatus.CANCELLED]: [],
};

function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

function isAuthorized(
  from: AppointmentStatus,
  to: AppointmentStatus,
  roles: UserRole[],
  isOwner: boolean
): boolean {
  const isAdmin = roles.includes(UserRole.ADMIN);
  const isSecretary = roles.includes(UserRole.SECRETARY);

  if (from === AppointmentStatus.SCHEDULED && to === AppointmentStatus.IN_PROGRESS)
    return isOwner || isAdmin;
  if (from === AppointmentStatus.SCHEDULED && to === AppointmentStatus.CANCELLED)
    return isAdmin || isSecretary || isOwner;
  if (from === AppointmentStatus.IN_PROGRESS && to === AppointmentStatus.DONE)
    return isOwner || isAdmin;
  if (from === AppointmentStatus.IN_PROGRESS && to === AppointmentStatus.CANCELLED)
    return isAdmin || isOwner;
  return false;
}

export class AppointmentStatusService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private doctorRepository: DoctorRepository
  ) {}

  async updateStatus(
    appointmentId: number,
    newStatus: AppointmentStatus,
    user: AuthenticatedUser
  ): Promise<AppointmentResponseDTO> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Consulta não encontrada.");

    if (!Object.values(AppointmentStatus).includes(newStatus)) {
      throw new AppError("DADOS_INVALIDOS", 400, "Status inválido.");
    }

    if (!canTransition(appointment.status, newStatus)) {
      throw new AppError("TRANSICAO_INVALIDA", 422, "Transição de status não permitida.");
    }

    const doctorOfUser = await this.doctorRepository.findByUserId(user.id);
    const isOwner = doctorOfUser?.id === appointment.doctor.id;

    if (!isAuthorized(appointment.status, newStatus, user.roles, isOwner)) {
      throw new AppError("ACESSO_NEGADO", 403, "Sem permissão para esta transição.");
    }

    appointment.status = newStatus;
    const saved = await this.appointmentRepository.save(appointment);
    return toAppointmentResponseDTO(saved);
  }
}

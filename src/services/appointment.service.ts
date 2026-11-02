import { DataSource } from "typeorm";
import { DoctorRepository } from "../repositories/doctor.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { AppointmentRepository, AppointmentFilters } from "../repositories/appointment.repository";
import { WorkScheduleRepository } from "../repositories/work-schedule.repository";
import { CreateAppointmentDTO } from "../dtos/appointment/create-appointment.dto";
import {
  toAppointmentResponseDTO,
  AppointmentResponseDTO,
} from "../dtos/appointment/appointment-response.dto";
import { AppError } from "../utils/app-error";
import { toClinicLocalTime, toMinutesSinceMidnight, toMinutes } from "../utils/datetime";
import { UserRole } from "../entities/user.entity";
import { paginate, PaginatedResult } from "../utils/pagination";

interface AuthenticatedUser {
  id: number;
  roles: UserRole[];
}

export class AppointmentService {
  constructor(
    private doctorRepository: DoctorRepository,
    private patientRepository: PatientRepository,
    private appointmentRepository: AppointmentRepository,
    private workScheduleRepository: WorkScheduleRepository,
    private dataSource: DataSource
  ) {}

  private async resolveSlot(doctorId: number, patientId: number, startsAt: Date) {
    const doctor = await this.doctorRepository.findById(doctorId);
    const patient = await this.patientRepository.findById(patientId);
    if (!doctor) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Médico não encontrado.");
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");

    const localStart = toClinicLocalTime(startsAt);
    const weekDay = localStart.getUTCDay();
    const shifts = await this.workScheduleRepository.findByDoctorAndWeekDay(doctorId, weekDay);

    const startMin = toMinutesSinceMidnight(localStart);
    const matchingShift = shifts.find((shift) => {
      const shiftStart = toMinutes(shift.startTime);
      const shiftEnd = toMinutes(shift.endTime);
      const withinShift = startMin >= shiftStart && startMin < shiftEnd;
      const alignedToGrid = (startMin - shiftStart) % shift.slotDurationMinutes === 0;
      const fitsBeforeShiftEnds = startMin + shift.slotDurationMinutes <= shiftEnd;
      return withinShift && alignedToGrid && fitsBeforeShiftEnds;
    });

    if (!matchingShift)
      throw new AppError("HORARIO_FORA_DA_ESCALA", 422, "Horário fora da escala do médico.");

    const endsAt = new Date(startsAt.getTime() + matchingShift.slotDurationMinutes * 60_000);
    return { endsAt };
  }

  async create(data: CreateAppointmentDTO): Promise<AppointmentResponseDTO> {
    const startsAt = new Date(data.startsAt);
    const { endsAt } = await this.resolveSlot(data.doctorId, data.patientId, startsAt);

    const appointment = await this.dataSource.transaction((manager) =>
      this.appointmentRepository.createLocked(
        manager,
        data.doctorId,
        data.patientId,
        startsAt,
        endsAt
      )
    );

    const full = await this.appointmentRepository.findById(appointment.id);
    return toAppointmentResponseDTO(full!);
  }

  async getCalendar(doctorId: number, from: string, to: string) {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Médico não encontrado.");

    const shifts = await this.workScheduleRepository.findByDoctor(doctorId);
    const appointments = await this.appointmentRepository.findActiveInRange(doctorId, from, to);

    return {
      workSchedule: {
        shifts: shifts.map((s) => ({
          weekDay: s.weekDay,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes,
        })),
      },
      appointments: appointments.map(toAppointmentResponseDTO),
    };
  }

  async getById(id: number, user: AuthenticatedUser): Promise<AppointmentResponseDTO> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Consulta não encontrada.");

    if (user.roles.includes(UserRole.DOCTOR) && !user.roles.includes(UserRole.ADMIN)) {
      const doctor = await this.doctorRepository.findByUserId(user.id);
      if (doctor?.id !== appointment.doctor.id) {
        throw new AppError("ACESSO_NEGADO", 403, "Sem acesso a esta consulta.");
      }
    }

    return toAppointmentResponseDTO(appointment);
  }

  async list(
    filters: AppointmentFilters,
    page: number,
    pageSize: number,
    user: AuthenticatedUser
  ): Promise<PaginatedResult<AppointmentResponseDTO>> {
    const effectiveFilters = { ...filters };

    if (user.roles.includes(UserRole.DOCTOR) && !user.roles.includes(UserRole.ADMIN)) {
      const doctor = await this.doctorRepository.findByUserId(user.id);
      effectiveFilters.doctorId = doctor?.id ?? -1;
    }

    const [items, total] = await this.appointmentRepository.findWithFilters(
      effectiveFilters,
      page,
      pageSize
    );
    return paginate(items.map(toAppointmentResponseDTO), total, page, pageSize);
  }
}

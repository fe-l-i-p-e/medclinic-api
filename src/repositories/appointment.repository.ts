import { Repository, EntityManager, In } from "typeorm";
import { DataSource } from "typeorm";
import { Appointment, AppointmentStatus } from "../entities/appointment.entity";
import { Doctor } from "../entities/doctor.entity";
import { AppError } from "../utils/app-error";

export interface AppointmentFilters {
  doctorId?: number;
  patientId?: number;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export class AppointmentRepository {
  private repo: Repository<Appointment>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(Appointment);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findActiveOverlap(doctorId: number, startsAt: Date, endsAt: Date) {
    return this.repo
      .createQueryBuilder("a")
      .where("a.doctor_id = :doctorId", { doctorId })
      .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.CANCELLED })
      .andWhere("a.startsAt < :endsAt AND a.endsAt > :startsAt", { startsAt, endsAt })
      .getOne();
  }

  findActivePatientOverlap(patientId: number, startsAt: Date, endsAt: Date) {
    return this.repo
      .createQueryBuilder("a")
      .where("a.patient_id = :patientId", { patientId })
      .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.CANCELLED })
      .andWhere("a.startsAt < :endsAt AND a.endsAt > :startsAt", { startsAt, endsAt })
      .getOne();
  }

  findActiveInRange(doctorId: number, from: string, to: string) {
    return this.repo
      .createQueryBuilder("a")
      .where("a.doctor_id = :doctorId", { doctorId })
      .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.CANCELLED })
      .andWhere("a.startsAt >= :from AND a.startsAt <= :to", {
        from: `${from}T00:00:00-03:00`,
        to: `${to}T23:59:59-03:00`,
      })
      .getMany();
  }

  async findWithFilters(filters: AppointmentFilters, page: number, pageSize: number) {
    const qb = this.repo.createQueryBuilder("a");
    if (filters.doctorId) qb.andWhere("a.doctor_id = :doctorId", { doctorId: filters.doctorId });
    if (filters.patientId)
      qb.andWhere("a.patient_id = :patientId", { patientId: filters.patientId });
    if (filters.status) qb.andWhere("a.status = :status", { status: filters.status });
    if (filters.from)
      qb.andWhere("a.startsAt >= :from", { from: `${filters.from}T00:00:00-03:00` });
    if (filters.to) qb.andWhere("a.startsAt <= :to", { to: `${filters.to}T23:59:59-03:00` });

    qb.skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("a.startsAt", "ASC");
    return qb.getManyAndCount();
  }

  countByDoctorPatientAndStatus(
    doctorId: number,
    patientId: number,
    statuses: AppointmentStatus[]
  ) {
    return this.repo.count({
      where: { doctor: { id: doctorId }, patient: { id: patientId }, status: In(statuses) },
    });
  }

  // Criação sob lock pessimista — ver appointment.service.ts para o uso completo
  async createLocked(
    manager: EntityManager,
    doctorId: number,
    patientId: number,
    startsAt: Date,
    endsAt: Date
  ): Promise<Appointment> {
    await manager
      .createQueryBuilder(Doctor, "doctor")
      .setLock("pessimistic_write")
      .where("doctor.id = :doctorId", { doctorId })
      .getOne();

    const doctorConflict = await manager
      .createQueryBuilder(Appointment, "a")
      .where("a.doctor_id = :doctorId", { doctorId })
      .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.CANCELLED })
      .andWhere("a.startsAt < :endsAt AND a.endsAt > :startsAt", { startsAt, endsAt })
      .getOne();
    if (doctorConflict)
      throw new AppError("HORARIO_INDISPONIVEL", 409, "Este horário acabou de ser ocupado.");

    const patientConflict = await manager
      .createQueryBuilder(Appointment, "a")
      .where("a.patient_id = :patientId", { patientId })
      .andWhere("a.status != :cancelled", { cancelled: AppointmentStatus.CANCELLED })
      .andWhere("a.startsAt < :endsAt AND a.endsAt > :startsAt", { startsAt, endsAt })
      .getOne();
    if (patientConflict)
      throw new AppError("PACIENTE_INDISPONIVEL", 409, "Paciente já tem consulta neste período.");

    const appointment = manager.create(Appointment, {
      doctor: { id: doctorId },
      patient: { id: patientId },
      startsAt,
      endsAt,
      status: AppointmentStatus.SCHEDULED,
    });
    return manager.save(appointment);
  }

  save(appointment: Appointment) {
    return this.repo.save(appointment);
  }
}

import { DoctorRepository } from "../repositories/doctor.repository";
import { WorkScheduleRepository } from "../repositories/work-schedule.repository";
import { ShiftInputDTO } from "../dtos/work-schedule/replace-work-schedule.dto";
import { WorkScheduleResponseDTO } from "../dtos/work-schedule/work-schedule-response.dto";
import { AppError } from "../utils/app-error";
import { toMinutes } from "../utils/datetime";

export class WorkScheduleService {
  constructor(
    private doctorRepository: DoctorRepository,
    private workScheduleRepository: WorkScheduleRepository
  ) {}

  async replaceSchedule(
    doctorId: number,
    shifts: ShiftInputDTO[]
  ): Promise<WorkScheduleResponseDTO> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Médico não encontrado.");

    for (const shift of shifts) {
      if (shift.weekDay < 0 || shift.weekDay > 6) {
        throw new AppError("DADOS_INVALIDOS", 400, "weekDay deve estar entre 0 e 6.");
      }
      if (!/^\d{2}:\d{2}$/.test(shift.startTime) || !/^\d{2}:\d{2}$/.test(shift.endTime)) {
        throw new AppError("DADOS_INVALIDOS", 400, "Horário fora do formato HH:MM.");
      }
      if (toMinutes(shift.startTime) >= toMinutes(shift.endTime)) {
        throw new AppError("DADOS_INVALIDOS", 400, "startTime deve ser menor que endTime.");
      }
      if (shift.slotDurationMinutes <= 0) {
        throw new AppError("DADOS_INVALIDOS", 400, "slotDurationMinutes deve ser maior que zero.");
      }
    }

    this.assertNoOverlapWithinDay(shifts);

    await this.workScheduleRepository.replaceAll(doctorId, shifts);
    return { shifts };
  }

  async getSchedule(doctorId: number): Promise<WorkScheduleResponseDTO> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Médico não encontrado.");

    const shifts = await this.workScheduleRepository.findByDoctor(doctorId);
    return {
      shifts: shifts.map((s) => ({
        weekDay: s.weekDay,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDurationMinutes: s.slotDurationMinutes,
      })),
    };
  }

  private assertNoOverlapWithinDay(shifts: ShiftInputDTO[]): void {
    const byDay = new Map<number, ShiftInputDTO[]>();
    for (const s of shifts) {
      const list = byDay.get(s.weekDay) ?? [];
      list.push(s);
      byDay.set(s.weekDay, list);
    }

    for (const dayShifts of byDay.values()) {
      for (let i = 0; i < dayShifts.length; i++) {
        for (let j = i + 1; j < dayShifts.length; j++) {
          const a = dayShifts[i],
            b = dayShifts[j];
          if (
            toMinutes(a.startTime) < toMinutes(b.endTime) &&
            toMinutes(b.startTime) < toMinutes(a.endTime)
          ) {
            throw new AppError("DADOS_INVALIDOS", 400, "Turnos do mesmo dia se sobrepõem.");
          }
        }
      }
    }
  }
}

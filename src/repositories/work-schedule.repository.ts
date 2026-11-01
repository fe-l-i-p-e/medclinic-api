import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { WorkScheduleShift } from "../entities/work-schedule-shift.entity";
import { ShiftInputDTO } from "../dtos/work-schedule/replace-work-schedule.dto";

export class WorkScheduleRepository {
  private repo: Repository<WorkScheduleShift>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(WorkScheduleShift);
  }

  findByDoctor(doctorId: number) {
    return this.repo.find({
      where: { doctor: { id: doctorId } },
      order: { weekDay: "ASC", startTime: "ASC" },
    });
  }

  findByDoctorAndWeekDay(doctorId: number, weekDay: number) {
    return this.repo.find({ where: { doctor: { id: doctorId }, weekDay } });
  }

  async replaceAll(doctorId: number, shifts: ShiftInputDTO[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(WorkScheduleShift, { doctor: { id: doctorId } });
      if (shifts.length === 0) return;
      const entities = shifts.map((s) =>
        manager.create(WorkScheduleShift, { ...s, doctor: { id: doctorId } })
      );
      await manager.save(entities);
    });
  }
}

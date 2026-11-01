import { describe, it, expect, vi } from "vitest";
import { WorkScheduleService } from "./work-schedule.service";

function makeService() {
  const doctorRepo = { findById: vi.fn().mockResolvedValue({ id: 1 }) } as any;
  const scheduleRepo = { replaceAll: vi.fn() } as any;
  return new WorkScheduleService(doctorRepo, scheduleRepo);
}

describe("WorkScheduleService.replaceSchedule", () => {
  it("aceita turnos encostados", async () => {
    const service = makeService();
    const result = await service.replaceSchedule(1, [
      { weekDay: 2, startTime: "08:00", endTime: "12:00", slotDurationMinutes: 30 },
      { weekDay: 2, startTime: "12:00", endTime: "18:00", slotDurationMinutes: 30 },
    ]);
    expect(result.shifts).toHaveLength(2);
  });

  it("recusa turnos sobrepostos no mesmo dia", async () => {
    const service = makeService();
    await expect(
      service.replaceSchedule(1, [
        { weekDay: 2, startTime: "08:00", endTime: "12:00", slotDurationMinutes: 30 },
        { weekDay: 2, startTime: "11:00", endTime: "15:00", slotDurationMinutes: 30 },
      ])
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });

  it("recusa startTime >= endTime", async () => {
    const service = makeService();
    await expect(
      service.replaceSchedule(1, [
        { weekDay: 2, startTime: "12:00", endTime: "08:00", slotDurationMinutes: 30 },
      ])
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });
});

import { describe, it, expect, vi } from "vitest";
import { WorkScheduleService } from "./work-schedule.service";

const shift = { weekDay: 2, startTime: "08:00", endTime: "12:00", slotDurationMinutes: 30 };

function makeService(doctor: unknown = { id: 1 }) {
  const doctorRepo = { findById: vi.fn().mockResolvedValue(doctor) } as any;
  const scheduleRepo = {
    replaceAll: vi.fn(),
    findByDoctor: vi.fn().mockResolvedValue([shift]),
  } as any;
  return { service: new WorkScheduleService(doctorRepo, scheduleRepo), scheduleRepo };
}

describe("WorkScheduleService — validações e consulta", () => {
  it("devolve 404 ao substituir escala de médico inexistente", async () => {
    const { service } = makeService(null);
    await expect(service.replaceSchedule(9, [shift])).rejects.toMatchObject({ statusCode: 404 });
  });

  it("recusa weekDay fora de 0 a 6", async () => {
    const { service } = makeService();
    await expect(service.replaceSchedule(1, [{ ...shift, weekDay: 7 }])).rejects.toMatchObject({
      code: "DADOS_INVALIDOS",
    });
  });

  it("recusa horário fora do formato HH:MM", async () => {
    const { service } = makeService();
    await expect(service.replaceSchedule(1, [{ ...shift, startTime: "8h" }])).rejects.toMatchObject(
      { code: "DADOS_INVALIDOS" }
    );
  });

  it("recusa duração de slot zero ou negativa", async () => {
    const { service } = makeService();
    await expect(
      service.replaceSchedule(1, [{ ...shift, slotDurationMinutes: 0 }])
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });

  it("aceita lista vazia e limpa a escala", async () => {
    const { service, scheduleRepo } = makeService();
    await service.replaceSchedule(1, []);
    expect(scheduleRepo.replaceAll).toHaveBeenCalledWith(1, []);
  });

  it("consulta a escala do médico", async () => {
    const { service } = makeService();
    expect((await service.getSchedule(1)).shifts).toEqual([shift]);
  });

  it("devolve 404 ao consultar escala de médico inexistente", async () => {
    const { service } = makeService(null);
    await expect(service.getSchedule(9)).rejects.toMatchObject({ statusCode: 404 });
  });
});

import { describe, it, expect, vi } from "vitest";
import { AppointmentService } from "./appointment.service";

function setup() {
  const doctorRepo = { findById: vi.fn().mockResolvedValue({ id: 1 }) } as any;
  const patientRepo = { findById: vi.fn().mockResolvedValue({ id: 10 }) } as any;
  const scheduleRepo = {
    findByDoctorAndWeekDay: vi
      .fn()
      .mockResolvedValue([
        { weekDay: 2, startTime: "08:00", endTime: "12:00", slotDurationMinutes: 30 },
      ]),
  } as any;
  const appointmentRepo = { createLocked: vi.fn(), findById: vi.fn() } as any;
  return new AppointmentService(doctorRepo, patientRepo, appointmentRepo, scheduleRepo, {} as any);
}

describe("AppointmentService — validação de horário", () => {
  it("recusa médico inexistente", async () => {
    const doctorRepo = { findById: vi.fn().mockResolvedValue(null) } as any;
    const patientRepo = { findById: vi.fn().mockResolvedValue({ id: 10 }) } as any;
    const service = new AppointmentService(
      doctorRepo,
      patientRepo,
      {} as any,
      {} as any,
      {} as any
    );
    await expect(
      service.create({ doctorId: 1, patientId: 10, startsAt: "2026-10-20T08:00:00-03:00" })
    ).rejects.toMatchObject({ code: "RECURSO_NAO_ENCONTRADO" });
  });

  it("recusa horário fora de qualquer turno", async () => {
    const service = setup();
    await expect(
      service.create({ doctorId: 1, patientId: 10, startsAt: "2026-10-20T20:00:00-03:00" })
    ).rejects.toMatchObject({ code: "HORARIO_FORA_DA_ESCALA" });
  });

  it("recusa horário desalinhado da grade", async () => {
    const service = setup();
    await expect(
      service.create({ doctorId: 1, patientId: 10, startsAt: "2026-10-20T08:20:00-03:00" })
    ).rejects.toMatchObject({ code: "HORARIO_FORA_DA_ESCALA" });
  });
});

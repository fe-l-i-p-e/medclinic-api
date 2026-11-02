import { describe, it, expect, vi } from "vitest";
import { AppointmentStatusService } from "./appointment-status.service";
import { AppointmentStatus } from "../entities/appointment.entity";
import { UserRole } from "../entities/user.entity";

function makeAppointment(status: AppointmentStatus) {
  return {
    id: 1,
    status,
    doctor: { id: 5 },
    patient: { id: 10 },
    startsAt: new Date("2026-10-20T11:00:00Z"),
    endsAt: new Date("2026-10-20T11:30:00Z"),
  } as any;
}

describe("AppointmentStatusService.updateStatus", () => {
  it("permite scheduled -> in_progress pelo médico dono", async () => {
    const appointmentRepo = {
      findById: vi.fn().mockResolvedValue(makeAppointment(AppointmentStatus.SCHEDULED)),
      save: vi.fn().mockImplementation(async (a) => a),
    } as any;
    const doctorRepo = { findByUserId: vi.fn().mockResolvedValue({ id: 5 }) } as any;
    const service = new AppointmentStatusService(appointmentRepo, doctorRepo);

    const result = await service.updateStatus(1, AppointmentStatus.IN_PROGRESS, {
      id: 99,
      roles: [UserRole.DOCTOR],
    });
    expect(result.status).toBe(AppointmentStatus.IN_PROGRESS);
  });

  it("recusa transição fora do ciclo (done -> scheduled)", async () => {
    const appointmentRepo = {
      findById: vi.fn().mockResolvedValue(makeAppointment(AppointmentStatus.DONE)),
    } as any;
    const doctorRepo = { findByUserId: vi.fn() } as any;
    const service = new AppointmentStatusService(appointmentRepo, doctorRepo);

    await expect(
      service.updateStatus(1, AppointmentStatus.SCHEDULED, { id: 99, roles: [UserRole.ADMIN] })
    ).rejects.toMatchObject({ code: "TRANSICAO_INVALIDA" });
  });

  it("recusa secretary cancelando consulta em andamento", async () => {
    const appointmentRepo = {
      findById: vi.fn().mockResolvedValue(makeAppointment(AppointmentStatus.IN_PROGRESS)),
    } as any;
    const doctorRepo = { findByUserId: vi.fn().mockResolvedValue(null) } as any;
    const service = new AppointmentStatusService(appointmentRepo, doctorRepo);

    await expect(
      service.updateStatus(1, AppointmentStatus.CANCELLED, { id: 99, roles: [UserRole.SECRETARY] })
    ).rejects.toMatchObject({ code: "ACESSO_NEGADO" });
  });
});

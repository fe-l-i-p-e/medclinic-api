import { describe, it, expect, vi } from "vitest";
import { AppointmentService } from "./appointment.service";
import { AppointmentStatusService } from "./appointment-status.service";
import { AppointmentStatus } from "../entities/appointment.entity";
import { UserRole } from "../entities/user.entity";

// 2026-10-20 é terça-feira; 11:00 UTC = 08:00 em America/Sao_Paulo
const START = "2026-10-20T11:00:00Z";
const shift = { weekDay: 2, startTime: "08:00", endTime: "12:00", slotDurationMinutes: 30 };

const stored = {
  id: 1,
  doctor: { id: 5 },
  patient: { id: 10 },
  startsAt: new Date(START),
  endsAt: new Date("2026-10-20T11:30:00Z"),
  status: AppointmentStatus.SCHEDULED,
};

function makeService(overrides: Record<string, unknown> = {}) {
  const doctorRepo = {
    findById: vi.fn().mockResolvedValue({ id: 5 }),
    findByUserId: vi.fn().mockResolvedValue({ id: 5 }),
  } as any;
  const patientRepo = { findById: vi.fn().mockResolvedValue({ id: 10 }) } as any;
  const appointmentRepo = {
    createLocked: vi.fn().mockResolvedValue({ id: 1 }),
    findById: vi.fn().mockResolvedValue(stored),
    findActiveInRange: vi.fn().mockResolvedValue([stored]),
    findWithFilters: vi.fn().mockResolvedValue([[stored], 1]),
    ...overrides,
  } as any;
  const scheduleRepo = {
    findByDoctorAndWeekDay: vi.fn().mockResolvedValue([shift]),
    findByDoctor: vi.fn().mockResolvedValue([shift]),
  } as any;
  const dataSource = { transaction: vi.fn(async (cb) => cb({})) } as any;
  const service = new AppointmentService(
    doctorRepo,
    patientRepo,
    appointmentRepo,
    scheduleRepo,
    dataSource
  );
  return { service, appointmentRepo, doctorRepo, patientRepo, dataSource };
}

describe("AppointmentService.create — fluxo de sucesso", () => {
  it("agenda dentro da escala e calcula o fim pela duração do slot", async () => {
    const { service, appointmentRepo, dataSource } = makeService();
    const result = await service.create({ doctorId: 5, patientId: 10, startsAt: START });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    const endsAt = appointmentRepo.createLocked.mock.calls[0][4] as Date;
    expect(endsAt.toISOString()).toBe("2026-10-20T11:30:00.000Z");
    expect(result.status).toBe(AppointmentStatus.SCHEDULED);
  });

  it("devolve 404 quando o paciente não existe", async () => {
    const { service, patientRepo } = makeService();
    patientRepo.findById.mockResolvedValue(null);
    await expect(
      service.create({ doctorId: 5, patientId: 99, startsAt: START })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("propaga conflito de horário vindo da transação", async () => {
    const conflict = Object.assign(new Error("conflito"), { code: "HORARIO_INDISPONIVEL" });
    const { service } = makeService({ createLocked: vi.fn().mockRejectedValue(conflict) });
    await expect(
      service.create({ doctorId: 5, patientId: 10, startsAt: START })
    ).rejects.toMatchObject({ code: "HORARIO_INDISPONIVEL" });
  });
});

describe("AppointmentService — calendário, detalhe e listagem", () => {
  it("monta o calendário com escala e consultas ativas", async () => {
    const { service } = makeService();
    const result = await service.getCalendar(5, "2026-10-19", "2026-10-25");
    expect(result.workSchedule.shifts).toHaveLength(1);
    expect(result.appointments).toHaveLength(1);
  });

  it("devolve 404 no calendário de médico inexistente", async () => {
    const { service, doctorRepo } = makeService();
    doctorRepo.findById.mockResolvedValue(null);
    await expect(service.getCalendar(9, "2026-10-19", "2026-10-25")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("admin vê qualquer consulta", async () => {
    const { service } = makeService();
    const result = await service.getById(1, { id: 1, roles: [UserRole.ADMIN] });
    expect(result.id).toBe(1);
  });

  it("médico dono vê a própria consulta", async () => {
    const { service } = makeService();
    const result = await service.getById(1, { id: 2, roles: [UserRole.DOCTOR] });
    expect(result.doctorId).toBe(5);
  });

  it("médico não vê consulta de outro médico", async () => {
    const { service, doctorRepo } = makeService();
    doctorRepo.findByUserId.mockResolvedValue({ id: 6 });
    await expect(service.getById(1, { id: 2, roles: [UserRole.DOCTOR] })).rejects.toMatchObject({
      code: "ACESSO_NEGADO",
    });
  });

  it("devolve 404 para consulta inexistente", async () => {
    const { service } = makeService({ findById: vi.fn().mockResolvedValue(null) });
    await expect(service.getById(9, { id: 1, roles: [UserRole.ADMIN] })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("médico só lista as próprias consultas, ignorando o filtro doctorId", async () => {
    const { service, appointmentRepo } = makeService();
    await service.list({ doctorId: 999 }, 1, 20, { id: 2, roles: [UserRole.DOCTOR] });
    expect(appointmentRepo.findWithFilters.mock.calls[0][0].doctorId).toBe(5);
  });

  it("secretária lista com os filtros informados", async () => {
    const { service, appointmentRepo } = makeService();
    const result = await service.list({ doctorId: 5 }, 1, 20, {
      id: 3,
      roles: [UserRole.SECRETARY],
    });
    expect(appointmentRepo.findWithFilters.mock.calls[0][0].doctorId).toBe(5);
    expect(result.meta.total).toBe(1);
  });
});

describe("AppointmentStatusService — demais transições", () => {
  function makeStatus(status: AppointmentStatus, doctorOfUser: unknown = { id: 5 }) {
    const appointmentRepo = {
      findById: vi.fn().mockResolvedValue({ ...stored, status }),
      save: vi.fn(async (a) => a),
    } as any;
    const doctorRepo = { findByUserId: vi.fn().mockResolvedValue(doctorOfUser) } as any;
    return new AppointmentStatusService(appointmentRepo, doctorRepo);
  }

  it("devolve 404 para consulta inexistente", async () => {
    const appointmentRepo = { findById: vi.fn().mockResolvedValue(null) } as any;
    const service = new AppointmentStatusService(appointmentRepo, {} as any);
    await expect(
      service.updateStatus(9, AppointmentStatus.CANCELLED, { id: 1, roles: [UserRole.ADMIN] })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("recusa status que não existe", async () => {
    const service = makeStatus(AppointmentStatus.SCHEDULED);
    await expect(
      service.updateStatus(1, "xpto" as AppointmentStatus, { id: 1, roles: [UserRole.ADMIN] })
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });

  it("secretária cancela consulta agendada", async () => {
    const service = makeStatus(AppointmentStatus.SCHEDULED, null);
    const result = await service.updateStatus(1, AppointmentStatus.CANCELLED, {
      id: 3,
      roles: [UserRole.SECRETARY],
    });
    expect(result.status).toBe(AppointmentStatus.CANCELLED);
  });

  it("médico dono conclui consulta em andamento", async () => {
    const service = makeStatus(AppointmentStatus.IN_PROGRESS);
    const result = await service.updateStatus(1, AppointmentStatus.DONE, {
      id: 2,
      roles: [UserRole.DOCTOR],
    });
    expect(result.status).toBe(AppointmentStatus.DONE);
  });

  it("admin cancela consulta em andamento", async () => {
    const service = makeStatus(AppointmentStatus.IN_PROGRESS, null);
    const result = await service.updateStatus(1, AppointmentStatus.CANCELLED, {
      id: 1,
      roles: [UserRole.ADMIN],
    });
    expect(result.status).toBe(AppointmentStatus.CANCELLED);
  });

  it("médico de outra agenda não inicia a consulta", async () => {
    const service = makeStatus(AppointmentStatus.SCHEDULED, { id: 6 });
    await expect(
      service.updateStatus(1, AppointmentStatus.IN_PROGRESS, { id: 2, roles: [UserRole.DOCTOR] })
    ).rejects.toMatchObject({ code: "ACESSO_NEGADO" });
  });
});

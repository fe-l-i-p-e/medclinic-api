import { describe, it, expect, vi } from "vitest";
import { MedicalRecordService } from "./medical-record.service";
import { UserRole } from "../entities/user.entity";

const record = {
  id: 1,
  patient: { id: 10 },
  doctor: { id: 5 },
  text: "Relato",
  createdAt: new Date(),
};

function makeService(opts: { patient?: unknown; doctor?: unknown; bond?: number } = {}) {
  const patientRepo = {
    findById: vi.fn().mockResolvedValue("patient" in opts ? opts.patient : { id: 10 }),
  } as any;
  const doctorRepo = {
    findByUserId: vi.fn().mockResolvedValue("doctor" in opts ? opts.doctor : { id: 5 }),
  } as any;
  const appointmentRepo = {
    countByDoctorPatientAndStatus: vi.fn().mockResolvedValue(opts.bond ?? 1),
  } as any;
  const recordRepo = {
    create: vi.fn().mockResolvedValue(record),
    findByPatient: vi.fn().mockResolvedValue([record]),
  } as any;
  return new MedicalRecordService(patientRepo, doctorRepo, appointmentRepo, recordRepo);
}

const doctorUser = { id: 1, roles: [UserRole.DOCTOR] };

describe("MedicalRecordService.create — validações", () => {
  it("devolve 404 quando o paciente não existe", async () => {
    const service = makeService({ patient: null });
    await expect(service.create(10, { text: "x" }, doctorUser)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("recusa texto vazio", async () => {
    const service = makeService();
    await expect(service.create(10, { text: "  " }, doctorUser)).rejects.toMatchObject({
      code: "DADOS_INVALIDOS",
    });
  });

  it("recusa usuário que não é médico", async () => {
    const service = makeService({ doctor: null });
    await expect(service.create(10, { text: "x" }, doctorUser)).rejects.toMatchObject({
      code: "ACESSO_NEGADO",
    });
  });
});

describe("MedicalRecordService.listByPatient", () => {
  it("admin lê sem precisar de vínculo", async () => {
    const service = makeService({ bond: 0 });
    const result = await service.listByPatient(10, { id: 1, roles: [UserRole.ADMIN] });
    expect(result).toHaveLength(1);
  });

  it("médico com vínculo lê o prontuário", async () => {
    const service = makeService({ bond: 1 });
    expect(await service.listByPatient(10, doctorUser)).toHaveLength(1);
  });

  it("médico sem vínculo é recusado", async () => {
    const service = makeService({ bond: 0 });
    await expect(service.listByPatient(10, doctorUser)).rejects.toMatchObject({
      code: "ACESSO_NEGADO",
    });
  });

  it("recusa usuário que não é médico nem admin", async () => {
    const service = makeService({ doctor: null });
    await expect(service.listByPatient(10, doctorUser)).rejects.toMatchObject({
      code: "ACESSO_NEGADO",
    });
  });

  it("devolve 404 quando o paciente não existe", async () => {
    const service = makeService({ patient: null });
    await expect(service.listByPatient(10, doctorUser)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

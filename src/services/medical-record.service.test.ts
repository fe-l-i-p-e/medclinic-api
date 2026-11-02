import { describe, it, expect, vi } from "vitest";
import { MedicalRecordService } from "./medical-record.service";
import { UserRole } from "../entities/user.entity";

function setup(hasBondResult: boolean) {
  const patientRepo = { findById: vi.fn().mockResolvedValue({ id: 10 }) } as any;
  const doctorRepo = { findByUserId: vi.fn().mockResolvedValue({ id: 5 }) } as any;
  const appointmentRepo = {
    countByDoctorPatientAndStatus: vi.fn().mockResolvedValue(hasBondResult ? 1 : 0),
  } as any;
  const recordRepo = {
    create: vi.fn().mockImplementation(async (d) => ({
      id: 1,
      patient: { id: d.patientId },
      doctor: { id: d.doctorId },
      text: d.text,
      createdAt: new Date(),
    })),
  } as any;
  return new MedicalRecordService(patientRepo, doctorRepo, appointmentRepo, recordRepo);
}

describe("MedicalRecordService.create", () => {
  it("médico com vínculo escreve normalmente", async () => {
    const service = setup(true);
    const result = await service.create(
      10,
      { text: "Relato..." },
      { id: 1, roles: [UserRole.DOCTOR] }
    );
    expect(result.doctorId).toBe(5);
  });

  it("médico sem vínculo recebe erro de acesso", async () => {
    const service = setup(false);
    await expect(
      service.create(10, { text: "Relato..." }, { id: 1, roles: [UserRole.DOCTOR] })
    ).rejects.toMatchObject({ code: "ACESSO_NEGADO" });
  });
});

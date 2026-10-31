import { describe, it, expect, vi } from "vitest";
import { DoctorService } from "./doctor.service";
import { AppError } from "../utils/app-error";

describe("DoctorService.create", () => {
  it("recusa e-mail já cadastrado", async () => {
    const doctorRepo = { findByCrm: vi.fn() } as any;
    const userRepo = { findByEmail: vi.fn().mockResolvedValue({ id: 1 }) } as any;
    const service = new DoctorService(doctorRepo, userRepo, {} as any);

    await expect(
      service.create({ name: "Dra. Helena", email: "h@x.com", password: "123", crm: "CRM-1" })
    ).rejects.toMatchObject({ code: "EMAIL_JA_CADASTRADO" });
  });

  it("recusa crm já cadastrado", async () => {
    const doctorRepo = { findByCrm: vi.fn().mockResolvedValue({ id: 1 }) } as any;
    const userRepo = { findByEmail: vi.fn().mockResolvedValue(null) } as any;
    const service = new DoctorService(doctorRepo, userRepo, {} as any);

    await expect(
      service.create({ name: "Dra. Helena", email: "h@x.com", password: "123", crm: "CRM-1" })
    ).rejects.toMatchObject({ code: "CRM_JA_CADASTRADO" });
  });

  it("recusa campo obrigatório ausente", async () => {
    const service = new DoctorService({} as any, {} as any, {} as any);
    await expect(service.create({ name: "", email: "", password: "", crm: "" })).rejects.toThrow(
      AppError
    );
  });
});

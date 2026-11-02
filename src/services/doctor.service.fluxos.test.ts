import { describe, it, expect, vi } from "vitest";
import { DoctorService } from "./doctor.service";

const fullDoctor = {
  id: 7,
  crm: "CRM-1",
  user: { id: 3, name: "Dra. Helena", email: "h@x.com", roles: ["doctor"] },
};

describe("DoctorService — fluxos de sucesso", () => {
  it("cria usuário e médico na mesma transação", async () => {
    const manager = {
      create: vi.fn((_entity, data) => data),
      save: vi.fn(async (entity) => ({ id: 7, ...entity })),
    };
    const dataSource = { transaction: vi.fn(async (cb) => cb(manager)) } as any;
    const doctorRepo = {
      findByCrm: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(fullDoctor),
    } as any;
    const userRepo = { findByEmail: vi.fn().mockResolvedValue(null) } as any;

    const service = new DoctorService(doctorRepo, userRepo, dataSource);
    const result = await service.create({
      name: "Dra. Helena",
      email: "h@x.com",
      password: "123",
      crm: "CRM-1",
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledTimes(2); // usuário e médico
    expect(result.crm).toBe("CRM-1");
    expect(result.user.roles).toEqual(["doctor"]);
  });

  it("busca médico por id", async () => {
    const service = new DoctorService(
      { findById: vi.fn().mockResolvedValue(fullDoctor) } as any,
      {} as any,
      {} as any
    );
    expect((await service.getById(7)).id).toBe(7);
  });

  it("devolve 404 para médico inexistente", async () => {
    const service = new DoctorService(
      { findById: vi.fn().mockResolvedValue(null) } as any,
      {} as any,
      {} as any
    );
    await expect(service.getById(9)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("lista médicos com paginação", async () => {
    const service = new DoctorService(
      { findWithFilters: vi.fn().mockResolvedValue([[fullDoctor], 1]) } as any,
      {} as any,
      {} as any
    );
    const result = await service.list("Helena", 1, 10);
    expect(result.meta.total).toBe(1);
  });
});

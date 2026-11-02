import { describe, it, expect, vi } from "vitest";
import { PatientService } from "./patient.service";

const patient = { id: 1, name: "Carlos", cpf: "12345678901", createdAt: new Date() };

describe("PatientService — consulta, edição e remoção", () => {
  it("busca paciente por id", async () => {
    const service = new PatientService({ findById: vi.fn().mockResolvedValue(patient) } as any);
    expect((await service.getById(1)).cpf).toBe("12345678901");
  });

  it("devolve 404 ao buscar paciente inexistente", async () => {
    const service = new PatientService({ findById: vi.fn().mockResolvedValue(null) } as any);
    await expect(service.getById(9)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("atualiza o nome do paciente", async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(patient),
      update: vi.fn().mockResolvedValue({ ...patient, name: "Novo" }),
    } as any;
    const service = new PatientService(repo);
    expect((await service.update(1, { name: "Novo" })).name).toBe("Novo");
  });

  it("devolve 404 ao atualizar paciente inexistente", async () => {
    const service = new PatientService({ findById: vi.fn().mockResolvedValue(null) } as any);
    await expect(service.update(9, { name: "X" })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("remove paciente existente (soft delete)", async () => {
    const repo = { findById: vi.fn().mockResolvedValue(patient), softDelete: vi.fn() } as any;
    await new PatientService(repo).remove(1);
    expect(repo.softDelete).toHaveBeenCalledWith(1);
  });

  it("devolve 404 ao remover paciente inexistente", async () => {
    const service = new PatientService({ findById: vi.fn().mockResolvedValue(null) } as any);
    await expect(service.remove(9)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("lista pacientes com envelope de paginação", async () => {
    const repo = { findWithFilters: vi.fn().mockResolvedValue([[patient], 1]) } as any;
    const result = await new PatientService(repo).list(undefined, 1, 20);
    expect(result.meta).toEqual({ total: 1, page: 1, pageSize: 20, totalPages: 1 });
    expect(result.data).toHaveLength(1);
  });
});

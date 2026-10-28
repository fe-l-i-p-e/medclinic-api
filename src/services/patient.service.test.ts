import { describe, it, expect, vi } from "vitest";
import { PatientService } from "./patient.service";
import { AppError } from "../utils/app-error";

function makeRepo(overrides: Partial<Record<string, any>> = {}) {
  return {
    findByCpf: vi.fn().mockResolvedValue(null),
    findById: vi
      .fn()
      .mockResolvedValue({ id: 1, name: "Carlos", cpf: "12345678901", createdAt: new Date() }),
    create: vi.fn().mockImplementation(async (d) => ({ id: 1, createdAt: new Date(), ...d })),
    update: vi.fn(),
    softDelete: vi.fn(),
    findWithFilters: vi.fn(),
    ...overrides,
  } as any;
}

describe("PatientService.create", () => {
  it("cria paciente com cpf válido", async () => {
    const service = new PatientService(makeRepo());
    const result = await service.create({ name: "Carlos", cpf: "12345678901" });
    expect(result.cpf).toBe("12345678901");
  });

  it("recusa cpf com tamanho errado", async () => {
    const service = new PatientService(makeRepo());
    await expect(service.create({ name: "Carlos", cpf: "123" })).rejects.toThrow(AppError);
  });

  it("recusa cpf duplicado", async () => {
    const repo = makeRepo({ findByCpf: vi.fn().mockResolvedValue({ id: 9 }) });
    const service = new PatientService(repo);
    await expect(service.create({ name: "Carlos", cpf: "12345678901" })).rejects.toMatchObject({
      code: "CPF_JA_CADASTRADO",
      statusCode: 409,
    });
  });

  it("recusa nome vazio", async () => {
    const service = new PatientService(makeRepo());
    await expect(service.create({ name: "", cpf: "12345678901" })).rejects.toThrow(AppError);
  });
});

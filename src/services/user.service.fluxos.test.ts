import { describe, it, expect, vi } from "vitest";
import { UserService } from "./user.service";
import { AuthService } from "./auth.service";

describe("UserService — consulta e validação", () => {
  const user = { id: 1, name: "A", email: "a@a.com", roles: ["admin"], password: "x" };

  it("busca usuário por id sem expor a senha", async () => {
    const service = new UserService({ findById: vi.fn().mockResolvedValue(user) } as any);
    const result = await service.getById(1);
    expect(result).not.toHaveProperty("password");
  });

  it("devolve 404 para usuário inexistente", async () => {
    const service = new UserService({ findById: vi.fn().mockResolvedValue(null) } as any);
    await expect(service.getById(9)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("recusa cadastro sem campos obrigatórios", async () => {
    const service = new UserService({} as any);
    await expect(
      service.create({ name: "", email: "", password: "", roles: [] })
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });
});

describe("AuthService — campos obrigatórios", () => {
  it("recusa login sem e-mail ou senha", async () => {
    const service = new AuthService({} as any);
    await expect(service.login({ email: "", password: "" })).rejects.toMatchObject({
      code: "DADOS_INVALIDOS",
    });
  });
});

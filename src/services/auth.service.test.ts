import { describe, it, expect, vi } from "vitest";
import { AuthService } from "./auth.service";
import bcrypt from "bcrypt";

vi.mock("../utils/jwt", () => ({ generateToken: () => "token-fake" }));

describe("AuthService.login", () => {
  it("recusa e-mail inexistente com CREDENCIAIS_INVALIDAS", async () => {
    const repo = { findByEmail: vi.fn().mockResolvedValue(null) } as any;
    const service = new AuthService(repo);
    await expect(service.login({ email: "x@x.com", password: "123" })).rejects.toMatchObject({
      code: "CREDENCIAIS_INVALIDAS",
      statusCode: 401,
    });
  });

  it("recusa senha errada comparando por hash", async () => {
    const hashed = await bcrypt.hash("senha-certa", 10);
    const repo = {
      findByEmail: vi.fn().mockResolvedValue({ id: 1, password: hashed, roles: ["admin"] }),
    } as any;
    const service = new AuthService(repo);
    await expect(
      service.login({ email: "x@x.com", password: "senha-errada" })
    ).rejects.toMatchObject({ code: "CREDENCIAIS_INVALIDAS" });
  });

  it("gera token para credenciais corretas", async () => {
    const hashed = await bcrypt.hash("senha-certa", 10);
    const repo = {
      findByEmail: vi.fn().mockResolvedValue({ id: 1, password: hashed, roles: ["admin"] }),
    } as any;
    const service = new AuthService(repo);
    const result = await service.login({ email: "x@x.com", password: "senha-certa" });
    expect(result.accessToken).toBeTruthy();
  });
});

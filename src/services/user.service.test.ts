import { describe, it, expect, vi } from "vitest";
import { UserService } from "./user.service";
import { UserRole } from "../entities/user.entity";

describe("UserService.create", () => {
  it("recusa perfil inexistente", async () => {
    const service = new UserService({ findByEmail: vi.fn() } as any);
    await expect(
      service.create({
        name: "A",
        email: "a@a.com",
        password: "123",
        roles: ["xpto" as unknown as UserRole],
      })
    ).rejects.toMatchObject({ code: "DADOS_INVALIDOS" });
  });

  it("recusa email duplicado", async () => {
    const service = new UserService({ findByEmail: vi.fn().mockResolvedValue({ id: 1 }) } as any);
    await expect(
      service.create({ name: "A", email: "a@a.com", password: "123", roles: [UserRole.ADMIN] })
    ).rejects.toMatchObject({ code: "EMAIL_JA_CADASTRADO" });
  });

  it("cria usuario com senha em hash", async () => {
    const create = vi.fn().mockImplementation(async (d) => ({ id: 1, ...d }));
    const service = new UserService({
      findByEmail: vi.fn().mockResolvedValue(null),
      create,
    } as any);
    const result = await service.create({
      name: "A",
      email: "a@a.com",
      password: "123",
      roles: [UserRole.SECRETARY],
    });
    expect(result.roles).toEqual([UserRole.SECRETARY]);
    expect(create.mock.calls[0][0].password).not.toBe("123");
  });
});

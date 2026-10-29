import { UserRepository } from "../repositories/user.repository";
import { LoginDTO } from "../dtos/auth/login.dto";
import { comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(data: LoginDTO): Promise<{ accessToken: string }> {
    if (!data.email || !data.password) {
      throw new AppError("DADOS_INVALIDOS", 400, "E-mail e senha são obrigatórios.");
    }

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new AppError("CREDENCIAIS_INVALIDAS", 401, "Credenciais inválidas.");

    const matches = await comparePassword(data.password, user.password);
    if (!matches) throw new AppError("CREDENCIAIS_INVALIDAS", 401, "Credenciais inválidas.");

    const accessToken = generateToken({ id: user.id, roles: user.roles });
    return { accessToken };
  }
}

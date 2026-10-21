import { UserRepository } from "../repositories/UserRepository";
import { LoginDTO } from "../dtos/LoginDTO";
import { comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

interface LoginResult {
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(data: LoginDTO): Promise<LoginResult> {
    if (!data.email || !data.password) {
      throw new AppError("E-mail e senha são obrigatórios.", 400);
    }

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const passwordMatches = await comparePassword(data.password, user.password);
    if (!passwordMatches) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const token = generateToken({ id: user.id, role: user.role });
    return { token };
  }
}
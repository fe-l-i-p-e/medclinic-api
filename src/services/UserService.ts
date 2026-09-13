import { UserRepository } from "../repositories/UserRepository";
import { CreateUserDTO } from "../dtos/CreateUserDTO";
import { toUserResponseDTO, UserResponseDTO } from "../dtos/UserResponseDTO";
import { hashPassword } from "../utils/hash";
import { AppError } from "../utils/AppError";
import { UserRole } from "../entities/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDTO): Promise<UserResponseDTO> {
    if (!data.name || !data.email || !data.password) {
      throw new AppError("Nome, e-mail e senha são obrigatórios.", 400);
    }

    if (!EMAIL_REGEX.test(data.email)) {
      throw new AppError("Formato de e-mail inválido.", 400);
    }

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Este e-mail já está cadastrado.", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? UserRole.ATTENDANT,
    });

    return toUserResponseDTO(user);
  }

  async getById(id: number): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    return toUserResponseDTO(user);
  }
}
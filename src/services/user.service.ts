import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO } from "../dtos/user/create-user.dto";
import { toUserResponseDTO, UserResponseDTO } from "../dtos/user/user-response.dto";
import { hashPassword } from "../utils/hash";
import { AppError } from "../utils/app-error";
import { UserRole } from "../entities/user.entity";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDTO): Promise<UserResponseDTO> {
    if (!data.name || !data.email || !data.password) {
      throw new AppError("DADOS_INVALIDOS", 400, "Campos obrigatórios ausentes.");
    }
    if (!data.roles?.length || !data.roles.every((r) => Object.values(UserRole).includes(r))) {
      throw new AppError("DADOS_INVALIDOS", 400, "Perfil inexistente em roles.");
    }

    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new AppError("EMAIL_JA_CADASTRADO", 409, "E-mail já cadastrado.");

    const hashedPassword = await hashPassword(data.password);
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roles: data.roles,
    });
    return toUserResponseDTO(user);
  }

  async getById(id: number): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Usuário não encontrado.");
    return toUserResponseDTO(user);
  }
}

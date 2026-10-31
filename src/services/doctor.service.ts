import { DataSource } from "typeorm";
import { DoctorRepository } from "../repositories/doctor.repository";
import { UserRepository } from "../repositories/user.repository";
import { CreateDoctorDTO } from "../dtos/doctor/create-doctor.dto";
import { toDoctorResponseDTO, DoctorResponseDTO } from "../dtos/doctor/doctor-response.dto";
import { AppError } from "../utils/app-error";
import { hashPassword } from "../utils/hash";
import { UserRole } from "../entities/user.entity";
import { User } from "../entities/user.entity";
import { Doctor } from "../entities/doctor.entity";
import { paginate, PaginatedResult } from "../utils/pagination";

export class DoctorService {
  constructor(
    private doctorRepository: DoctorRepository,
    private userRepository: UserRepository,
    private dataSource: DataSource
  ) {}

  async create(data: CreateDoctorDTO): Promise<DoctorResponseDTO> {
    if (!data.name || !data.email || !data.password || !data.crm) {
      throw new AppError("DADOS_INVALIDOS", 400, "Campos obrigatórios ausentes.");
    }

    const emailInUse = await this.userRepository.findByEmail(data.email);
    if (emailInUse) throw new AppError("EMAIL_JA_CADASTRADO", 409, "E-mail já cadastrado.");

    const crmInUse = await this.doctorRepository.findByCrm(data.crm);
    if (crmInUse) throw new AppError("CRM_JA_CADASTRADO", 409, "CRM já cadastrado.");

    // RF03: cria usuário + médico na MESMA transação — falha de um desfaz o outro
    const doctor = await this.dataSource.transaction(async (manager) => {
      const hashedPassword = await hashPassword(data.password);
      const user = manager.create(User, {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roles: [UserRole.DOCTOR],
      });
      const savedUser = await manager.save(user);

      const newDoctor = manager.create(Doctor, { crm: data.crm, user: savedUser });
      return manager.save(newDoctor);
    });

    const full = await this.doctorRepository.findById(doctor.id);
    return toDoctorResponseDTO(full!);
  }

  async getById(id: number): Promise<DoctorResponseDTO> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Médico não encontrado.");
    return toDoctorResponseDTO(doctor);
  }

  async list(
    name: string | undefined,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<DoctorResponseDTO>> {
    const [items, total] = await this.doctorRepository.findWithFilters(name, page, pageSize);
    return paginate(items.map(toDoctorResponseDTO), total, page, pageSize);
  }
}

import { PatientRepository } from "../repositories/patient.repository";
import { CreatePatientDTO } from "../dtos/patient/create-patient.dto";
import { UpdatePatientDTO } from "../dtos/patient/update-patient.dto";
import { toPatientResponseDTO, PatientResponseDTO } from "../dtos/patient/patient-response.dto";
import { AppError } from "../utils/app-error";
import { paginate, PaginatedResult } from "../utils/pagination";

export class PatientService {
  constructor(private patientRepository: PatientRepository) {}

  async create(data: CreatePatientDTO): Promise<PatientResponseDTO> {
    if (!data.name?.trim()) throw new AppError("DADOS_INVALIDOS", 400, "Nome é obrigatório.");
    if (!/^\d{11}$/.test(data.cpf ?? "")) {
      throw new AppError("DADOS_INVALIDOS", 400, "CPF deve ter 11 dígitos numéricos.");
    }

    const existing = await this.patientRepository.findByCpf(data.cpf);
    if (existing) throw new AppError("CPF_JA_CADASTRADO", 409, "CPF já cadastrado.");

    const patient = await this.patientRepository.create({ name: data.name, cpf: data.cpf });
    return toPatientResponseDTO(patient);
  }

  async getById(id: number): Promise<PatientResponseDTO> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");
    return toPatientResponseDTO(patient);
  }

  async update(id: number, data: UpdatePatientDTO): Promise<PatientResponseDTO> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");

    const updated = await this.patientRepository.update(id, data);
    return toPatientResponseDTO(updated!);
  }

  async remove(id: number): Promise<void> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) throw new AppError("RECURSO_NAO_ENCONTRADO", 404, "Paciente não encontrado.");
    await this.patientRepository.softDelete(id);
  }

  async list(
    name: string | undefined,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<PatientResponseDTO>> {
    const [items, total] = await this.patientRepository.findWithFilters(name, page, pageSize);
    return paginate(items.map(toPatientResponseDTO), total, page, pageSize);
  }
}

import { Repository, ILike } from "typeorm";
import { DataSource } from "typeorm";
import { Patient } from "../entities/patient.entity";

export class PatientRepository {
  private repo: Repository<Patient>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(Patient);
  }

  findByCpf(cpf: string) {
    return this.repo.findOne({ where: { cpf } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Patient>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Patient>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  softDelete(id: number) {
    return this.repo.softDelete(id);
  }

  async findWithFilters(name: string | undefined, page: number, pageSize: number) {
    const [data, total] = await this.repo.findAndCount({
      where: name ? { name: ILike(`%${name}%`) } : {},
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: "ASC" },
    });
    return [data, total] as const;
  }
}

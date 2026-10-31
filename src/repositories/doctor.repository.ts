import { Repository, ILike } from "typeorm";
import { DataSource } from "typeorm";
import { Doctor } from "../entities/doctor.entity";
import { EntityManager } from "typeorm";

export class DoctorRepository {
  private repo: Repository<Doctor>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(Doctor);
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByCrm(crm: string) {
    return this.repo.findOne({ where: { crm } });
  }

  findByUserId(userId: number) {
    return this.repo.findOne({ where: { user: { id: userId } } });
  }

  // Usado dentro da transação de criação (ver doctor.service.ts)
  createWithManager(manager: EntityManager, data: { crm: string; userId: number }) {
    const doctor = manager.create(Doctor, { crm: data.crm, user: { id: data.userId } });
    return manager.save(doctor);
  }

  async findWithFilters(name: string | undefined, page: number, pageSize: number) {
    const [data, total] = await this.repo.findAndCount({
      where: name ? { user: { name: ILike(`%${name}%`) } } : {},
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: "ASC" },
    });
    return [data, total] as const;
  }
}

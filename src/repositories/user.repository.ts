import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";

export class UserRepository {
  private repo: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(User);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }
}

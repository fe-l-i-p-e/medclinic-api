import { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { MedicalRecord } from "../entities/medical-record.entity";

export class MedicalRecordRepository {
  private repo: Repository<MedicalRecord>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(MedicalRecord);
  }

  create(data: { patientId: number; doctorId: number; text: string }) {
    const record = this.repo.create({
      patient: { id: data.patientId },
      doctor: { id: data.doctorId },
      text: data.text,
    });
    return this.repo.save(record);
  }

  findByPatient(patientId: number) {
    return this.repo.find({ where: { patient: { id: patientId } }, order: { createdAt: "DESC" } });
  }
}

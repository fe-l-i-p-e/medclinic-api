import { Request, Response, NextFunction } from "express";
import { MedicalRecordService } from "../services/medical-record.service";
import { paginate } from "../utils/pagination";

export class MedicalRecordController {
  constructor(private medicalRecordService: MedicalRecordService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await this.medicalRecordService.create(
        Number(req.params.patientId),
        req.body,
        req.user!
      );
      return res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const records = await this.medicalRecordService.listByPatient(
        Number(req.params.patientId),
        req.user!
      );
      return res.status(200).json(paginate(records, records.length, 1, records.length || 1));
    } catch (error) {
      next(error);
    }
  };
}

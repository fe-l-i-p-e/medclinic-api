import { Request, Response, NextFunction } from "express";
import { PatientService } from "../services/patient.service";
import { parsePagination } from "../utils/pagination";

export class PatientController {
  constructor(private patientService: PatientService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await this.patientService.create(req.body);
      return res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const name = typeof req.query.name === "string" ? req.query.name : undefined;
      const result = await this.patientService.list(name, page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await this.patientService.getById(Number(req.params.id));
      return res.status(200).json(patient);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await this.patientService.update(Number(req.params.id), req.body);
      return res.status(200).json(patient);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.patientService.remove(Number(req.params.id));
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { DoctorService } from "../services/doctor.service";
import { WorkScheduleService } from "../services/work-schedule.service";
import { parsePagination } from "../utils/pagination";

export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private workScheduleService: WorkScheduleService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctor = await this.doctorService.create(req.body);
      return res.status(201).json(doctor);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const name = typeof req.query.name === "string" ? req.query.name : undefined;
      const result = await this.doctorService.list(name, page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctor = await this.doctorService.getById(Number(req.params.id));
      return res.status(200).json(doctor);
    } catch (error) {
      next(error);
    }
  };

  replaceWorkSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.workScheduleService.replaceSchedule(
        Number(req.params.doctorId),
        req.body.shifts ?? []
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getWorkSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.workScheduleService.getSchedule(Number(req.params.doctorId));
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

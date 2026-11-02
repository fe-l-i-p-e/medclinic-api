import { Request, Response, NextFunction } from "express";
import { DoctorService } from "../services/doctor.service";
import { WorkScheduleService } from "../services/work-schedule.service";
import { AppointmentService } from "../services/appointment.service";
import { parsePagination } from "../utils/pagination";
import { isValidDateRange } from "../utils/datetime";
import { AppError } from "../utils/app-error";

export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private workScheduleService: WorkScheduleService,
    private appointmentService: AppointmentService
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

  getCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = String(req.query.from ?? "");
      const to = String(req.query.to ?? "");
      if (!isValidDateRange(from, to)) {
        throw new AppError("DADOS_INVALIDOS", 400, "Intervalo de datas inválido (máx. 31 dias).");
      }
      const result = await this.appointmentService.getCalendar(
        Number(req.params.doctorId),
        from,
        to
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

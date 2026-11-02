import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointment.service";
import { AppointmentStatusService } from "../services/appointment-status.service";
import { AppointmentStatus } from "../entities/appointment.entity";
import { parsePagination } from "../utils/pagination";

export class AppointmentController {
  constructor(
    private appointmentService: AppointmentService,
    private statusService: AppointmentStatusService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await this.appointmentService.create(req.body);
      return res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = parsePagination(req.query);
      const filters = {
        doctorId: req.query.doctorId ? Number(req.query.doctorId) : undefined,
        patientId: req.query.patientId ? Number(req.query.patientId) : undefined,
        status: req.query.status as AppointmentStatus | undefined,
        from: typeof req.query.from === "string" ? req.query.from : undefined,
        to: typeof req.query.to === "string" ? req.query.to : undefined,
      };
      const result = await this.appointmentService.list(filters, page, pageSize, req.user!);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await this.appointmentService.getById(Number(req.params.id), req.user!);
      return res.status(200).json(appointment);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.statusService.updateStatus(
        Number(req.params.id),
        req.body.status,
        req.user!
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

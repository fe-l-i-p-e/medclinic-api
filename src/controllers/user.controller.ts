import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.register(req.body);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getById(req.user!.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
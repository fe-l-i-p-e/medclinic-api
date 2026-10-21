import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.create(req.body);
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

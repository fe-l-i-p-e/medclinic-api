import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

import { UserRole } from "../../entities/user.entity";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; roles: UserRole[] };
    }
  }
}

export {};

import { UserRole } from "../entities/User";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
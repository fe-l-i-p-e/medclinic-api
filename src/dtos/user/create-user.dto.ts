import { UserRole } from "../../entities/user.entity";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
}

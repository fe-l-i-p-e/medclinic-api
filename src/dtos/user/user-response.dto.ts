import { User } from "../../entities/user.entity";

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export function toUserResponseDTO(user: User): UserResponseDTO {
  return { id: user.id, name: user.name, email: user.email, roles: user.roles };
}

import { User } from "../entities/User";

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export function toUserResponseDTO(user: User): UserResponseDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
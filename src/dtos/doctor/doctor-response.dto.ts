import { Doctor } from "../../entities/doctor.entity";

export interface DoctorResponseDTO {
  id: number;
  crm: string;
  user: { id: number; name: string; email: string; roles: string[] };
}

export function toDoctorResponseDTO(doctor: Doctor): DoctorResponseDTO {
  return {
    id: doctor.id,
    crm: doctor.crm,
    user: {
      id: doctor.user.id,
      name: doctor.user.name,
      email: doctor.user.email,
      roles: doctor.user.roles,
    },
  };
}

import { Patient } from "../../entities/patient.entity";

export interface PatientResponseDTO {
  id: number;
  name: string;
  cpf: string;
  createdAt: Date;
}

export function toPatientResponseDTO(patient: Patient): PatientResponseDTO {
  return { id: patient.id, name: patient.name, cpf: patient.cpf, createdAt: patient.createdAt };
}

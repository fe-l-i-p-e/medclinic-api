import { MedicalRecord } from "../../entities/medical-record.entity";

export interface MedicalRecordResponseDTO {
  id: number;
  patientId: number;
  doctorId: number;
  text: string;
  createdAt: Date;
}

export function toMedicalRecordResponseDTO(r: MedicalRecord): MedicalRecordResponseDTO {
  return {
    id: r.id,
    patientId: r.patient.id,
    doctorId: r.doctor.id,
    text: r.text,
    createdAt: r.createdAt,
  };
}

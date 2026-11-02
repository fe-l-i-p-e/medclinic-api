import { Appointment } from "../../entities/appointment.entity";

export interface AppointmentResponseDTO {
  id: number;
  doctorId: number;
  patientId: number;
  startsAt: string;
  endsAt: string;
  status: string;
}

export function toAppointmentResponseDTO(a: Appointment): AppointmentResponseDTO {
  return {
    id: a.id,
    doctorId: a.doctor.id,
    patientId: a.patient.id,
    startsAt: a.startsAt.toISOString(),
    endsAt: a.endsAt.toISOString(),
    status: a.status,
  };
}

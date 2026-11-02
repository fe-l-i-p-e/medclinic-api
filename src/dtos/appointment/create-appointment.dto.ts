export interface CreateAppointmentDTO {
  doctorId: number;
  patientId: number;
  startsAt: string; // ISO 8601 com fuso
}

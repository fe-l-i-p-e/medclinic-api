import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "./doctor.entity";
import { Patient } from "./patient.entity";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  CANCELLED = "cancelled",
}

@Entity("appointment")
export class Appointment {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => Doctor, { eager: true }) @JoinColumn({ name: "doctor_id" }) doctor!: Doctor;
  @ManyToOne(() => Patient, { eager: true }) @JoinColumn({ name: "patient_id" }) patient!: Patient;

  @Column({ name: "starts_at", type: "timestamptz" }) startsAt!: Date;
  @Column({ name: "ends_at", type: "timestamptz" }) endsAt!: Date;

  @Column({ type: "enum", enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status!: AppointmentStatus;
}

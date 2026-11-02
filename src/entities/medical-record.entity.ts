import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Patient } from "./patient.entity";
import { Doctor } from "./doctor.entity";

@Entity("medical_record")
export class MedicalRecord {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => Patient) @JoinColumn({ name: "patient_id" }) patient!: Patient;
  @ManyToOne(() => Doctor, { eager: true }) @JoinColumn({ name: "doctor_id" }) doctor!: Doctor;

  @Column({ type: "text" }) text!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

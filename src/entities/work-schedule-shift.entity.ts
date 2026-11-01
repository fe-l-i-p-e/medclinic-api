import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "./doctor.entity";

@Entity("work_schedule_shift")
export class WorkScheduleShift {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => Doctor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "doctor_id" })
  doctor!: Doctor;

  @Column({ name: "week_day", type: "smallint" }) weekDay!: number;
  @Column({ name: "start_time", type: "varchar", length: 5 }) startTime!: string;
  @Column({ name: "end_time", type: "varchar", length: 5 }) endTime!: string;
  @Column({ name: "slot_duration_minutes", type: "int" }) slotDurationMinutes!: number;
}

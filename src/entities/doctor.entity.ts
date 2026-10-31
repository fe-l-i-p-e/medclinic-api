import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("doctor")
export class Doctor {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 30, unique: true }) crm!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user!: User;
}

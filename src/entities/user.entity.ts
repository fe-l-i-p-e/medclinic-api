import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  SECRETARY = "secretary",
  DOCTOR = "doctor",
}

@Entity("user")
export class User {
  @PrimaryGeneratedColumn() id!: number;

  @Column({ length: 120 }) name!: string;

  @Column({ length: 160, unique: true }) email!: string;

  @Column({ length: 255 }) password!: string;

  @Column({ type: "simple-array" }) roles!: UserRole[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}

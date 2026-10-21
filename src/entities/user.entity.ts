// @ts-nocheck
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  ATTENDANT = "attendant",
}

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 160, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.ATTENDANT,
  })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
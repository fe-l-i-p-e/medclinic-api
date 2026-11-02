import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793657680107 implements MigrationInterface {
    name = 'InitialSchema1793657680107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "email" character varying(160) NOT NULL, "password" character varying(255) NOT NULL, "roles" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "cpf" character varying(11) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_d1206b00842f789e35c7c5baf61" UNIQUE ("cpf"), CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor" ("id" SERIAL NOT NULL, "crm" character varying(30) NOT NULL, "user_id" integer, CONSTRAINT "UQ_aab8f24bc311f018cf511577ac6" UNIQUE ("crm"), CONSTRAINT "REL_a685e79dc974f768c39e5d1228" UNIQUE ("user_id"), CONSTRAINT "PK_ee6bf6c8de78803212c548fcb94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_record" ("id" SERIAL NOT NULL, "text" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "patient_id" integer, "doctor_id" integer, CONSTRAINT "PK_d96ede886356ac47ddcbb0bf3a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('scheduled', 'in_progress', 'done', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'scheduled', "doctor_id" integer, "patient_id" integer, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "work_schedule_shift" ("id" SERIAL NOT NULL, "week_day" smallint NOT NULL, "start_time" character varying(5) NOT NULL, "end_time" character varying(5) NOT NULL, "slot_duration_minutes" integer NOT NULL, "doctor_id" integer, CONSTRAINT "PK_05d6b230084f301e04c77b84be8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_a685e79dc974f768c39e5d12281" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_record" ADD CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_record" ADD CONSTRAINT "FK_23deee613f747f04d2039fa9474" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_9a9c484aa4a944eaec632e00a81" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_86b3e35a97e289071b4785a1402" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_schedule_shift" ADD CONSTRAINT "FK_3d895e668266995370ea7e562db" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_schedule_shift" DROP CONSTRAINT "FK_3d895e668266995370ea7e562db"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_86b3e35a97e289071b4785a1402"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_9a9c484aa4a944eaec632e00a81"`);
        await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT "FK_23deee613f747f04d2039fa9474"`);
        await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_a685e79dc974f768c39e5d12281"`);
        await queryRunner.query(`DROP TABLE "work_schedule_shift"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
        await queryRunner.query(`DROP TABLE "medical_record"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "patient"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}

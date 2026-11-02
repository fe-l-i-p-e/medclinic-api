import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedicalRecord1793645010044 implements MigrationInterface {
    name = 'CreateMedicalRecord1793645010044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_record" ("id" SERIAL NOT NULL, "text" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "patient_id" integer, "doctor_id" integer, CONSTRAINT "PK_d96ede886356ac47ddcbb0bf3a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_record" ADD CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_record" ADD CONSTRAINT "FK_23deee613f747f04d2039fa9474" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT "FK_23deee613f747f04d2039fa9474"`);
        await queryRunner.query(`ALTER TABLE "medical_record" DROP CONSTRAINT "FK_dddd1dc79ff4c20ae61b62f9add"`);
        await queryRunner.query(`DROP TABLE "medical_record"`);
    }

}

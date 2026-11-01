import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkScheduleShift1793497438216 implements MigrationInterface {
    name = 'CreateWorkScheduleShift1793497438216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "work_schedule_shift" ("id" SERIAL NOT NULL, "week_day" smallint NOT NULL, "start_time" character varying(5) NOT NULL, "end_time" character varying(5) NOT NULL, "slot_duration_minutes" integer NOT NULL, "doctor_id" integer, CONSTRAINT "PK_05d6b230084f301e04c77b84be8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "work_schedule_shift" ADD CONSTRAINT "FK_3d895e668266995370ea7e562db" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "work_schedule_shift" DROP CONSTRAINT "FK_3d895e668266995370ea7e562db"`);
        await queryRunner.query(`DROP TABLE "work_schedule_shift"`);
    }

}

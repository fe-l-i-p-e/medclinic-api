import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcrypt";

export class SeedAdmin1793800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password) return;

    const hashedPassword = await bcrypt.hash(password, 10);
    await queryRunner.query(
      `INSERT INTO "user" (name, email, password, roles) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ["Administrador", email, hashedPassword, "admin"]
    );
  }

  public async down(): Promise<void> {}
}

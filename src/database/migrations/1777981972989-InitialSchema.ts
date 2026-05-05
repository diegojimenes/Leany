import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777981972989 implements MigrationInterface {
    name = 'InitialSchema1777981972989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cep" character varying NOT NULL, "street" character varying NOT NULL, "neighborhood" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "trainerId" uuid, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_41aa769237c813f7ffebd0b26c" ON "addresses" ("cep") `);
        await queryRunner.query(`CREATE TABLE "pokemon" ("id" integer NOT NULL, "name" character varying NOT NULL, "types" jsonb, "sprite" character varying, "lastSyncedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b503db1369f46c43f8da0a6a0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1cb8fc72a68e5a601312c642c8" ON "pokemon" ("name") `);
        await queryRunner.query(`CREATE TABLE "team_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teamId" uuid, "pokemonId" integer, CONSTRAINT "UQ_6353d862b72248a951e54c9142e" UNIQUE ("teamId", "pokemonId"), CONSTRAINT "PK_2bec44e343c84ec77289339765d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "trainerId" uuid, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trainers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_198da56395c269936d351ab774b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_8e7d663f4d67304dd5afe2843f4" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_bd3e6421adfd197b902ece3cbc1" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_ceb53e54b78da7a402c33459b83" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_d893d0b7e570b86d2f571ce28d0" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_d893d0b7e570b86d2f571ce28d0"`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_ceb53e54b78da7a402c33459b83"`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_bd3e6421adfd197b902ece3cbc1"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_8e7d663f4d67304dd5afe2843f4"`);
        await queryRunner.query(`DROP TABLE "trainers"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "team_pokemons"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cb8fc72a68e5a601312c642c8"`);
        await queryRunner.query(`DROP TABLE "pokemon"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41aa769237c813f7ffebd0b26c"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
    }

}

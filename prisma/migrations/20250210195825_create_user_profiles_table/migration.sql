-- CreateEnum
CREATE TYPE "public"."MEMBER_ROLE" AS ENUM ('host', 'guest', 'admin');

-- AlterTable
ALTER TABLE "public"."members" ADD COLUMN     "role" "public"."MEMBER_ROLE" NOT NULL DEFAULT 'guest';

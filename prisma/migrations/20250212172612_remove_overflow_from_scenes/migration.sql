/*
  Warnings:

  - You are about to drop the `_membersToscene` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_membersToscene" DROP CONSTRAINT "_membersToscene_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_membersToscene" DROP CONSTRAINT "_membersToscene_B_fkey";

-- DropTable
DROP TABLE "public"."_membersToscene";

-- CreateEnum
CREATE TYPE "public"."CALL_SCENE" AS ENUM ('pull', 'twoUp', 'fourUp', 'splash', 'threeUp', 'countdown', 'spotlight');

-- CreateTable
CREATE TABLE "public"."scene" (
    "id" UUID NOT NULL,
    "type" "public"."CALL_SCENE" NOT NULL,
    "label" TEXT NOT NULL,
    "callId" UUID NOT NULL,
    "AID" UUID,
    "BID" UUID,
    "CID" UUID,
    "DID" UUID,

    CONSTRAINT "scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_membersToscene" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_membersToscene_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_membersToscene_B_index" ON "public"."_membersToscene"("B");

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_AID_fkey" FOREIGN KEY ("AID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_BID_fkey" FOREIGN KEY ("BID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_CID_fkey" FOREIGN KEY ("CID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_DID_fkey" FOREIGN KEY ("DID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_membersToscene" ADD CONSTRAINT "_membersToscene_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_membersToscene" ADD CONSTRAINT "_membersToscene_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

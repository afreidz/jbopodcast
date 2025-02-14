-- CreateEnum
CREATE TYPE "public"."MEMBER_ROLE" AS ENUM ('host', 'guest', 'admin');

-- CreateEnum
CREATE TYPE "public"."CALL_SCENE" AS ENUM ('pull', 'twoUp', 'fourUp', 'splash', 'threeUp', 'countdown', 'spotlight');

-- CreateTable
CREATE TABLE "public"."members" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "handle" TEXT,
    "role" "public"."MEMBER_ROLE" NOT NULL DEFAULT 'guest',

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calls" (
    "id" UUID NOT NULL,
    "scheduled" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" TIMESTAMPTZ(0),
    "title" TEXT,
    "hostId" UUID NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scene" (
    "id" UUID NOT NULL,
    "type" "public"."CALL_SCENE" NOT NULL,
    "label" TEXT NOT NULL,
    "callId" UUID NOT NULL,
    "splashImageURL" TEXT,
    "countdownMS" INTEGER,
    "AID" UUID,
    "BID" UUID,
    "CID" UUID,
    "DID" UUID,

    CONSTRAINT "scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connection" (
    "id" UUID NOT NULL,
    "callId" UUID NOT NULL,
    "fromId" UUID NOT NULL,
    "toId" UUID NOT NULL,
    "offer" JSONB,
    "answer" JSONB,
    "ice" JSONB,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_GuestRelation" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_GuestRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_handle_key" ON "public"."members"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "calls_scheduled_hostId_key" ON "public"."calls"("scheduled", "hostId");

-- CreateIndex
CREATE UNIQUE INDEX "connection_callId_fromId_toId_key" ON "public"."connection"("callId", "fromId", "toId");

-- CreateIndex
CREATE INDEX "_GuestRelation_B_index" ON "public"."_GuestRelation"("B");

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."calls" ADD CONSTRAINT "calls_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_AID_fkey" FOREIGN KEY ("AID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_BID_fkey" FOREIGN KEY ("BID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_CID_fkey" FOREIGN KEY ("CID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_DID_fkey" FOREIGN KEY ("DID") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scene" ADD CONSTRAINT "scene_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuestRelation" ADD CONSTRAINT "_GuestRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuestRelation" ADD CONSTRAINT "_GuestRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

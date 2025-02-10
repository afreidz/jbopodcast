/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
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
CREATE TABLE "public"."_GuestRelation" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_GuestRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GuestRelation_B_index" ON "public"."_GuestRelation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "members_handle_key" ON "public"."members"("handle");

-- AddForeignKey
ALTER TABLE "public"."calls" ADD CONSTRAINT "calls_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuestRelation" ADD CONSTRAINT "_GuestRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GuestRelation" ADD CONSTRAINT "_GuestRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

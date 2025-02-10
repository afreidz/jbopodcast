/*
  Warnings:

  - A unique constraint covering the columns `[scheduled,hostId]` on the table `calls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "calls_scheduled_hostId_key" ON "public"."calls"("scheduled", "hostId");

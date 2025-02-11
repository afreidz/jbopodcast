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

-- CreateIndex
CREATE UNIQUE INDEX "connection_callId_fromId_toId_key" ON "public"."connection"("callId", "fromId", "toId");

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_callId_fkey" FOREIGN KEY ("callId") REFERENCES "public"."calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

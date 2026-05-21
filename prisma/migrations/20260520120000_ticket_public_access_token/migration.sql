ALTER TABLE "Ticket" ADD COLUMN "publicAccessToken" TEXT;

UPDATE "Ticket"
SET "publicAccessToken" =
  md5(random()::text || clock_timestamp()::text || id) ||
  md5(id || clock_timestamp()::text || random()::text)
WHERE "publicAccessToken" IS NULL;

ALTER TABLE "Ticket" ALTER COLUMN "publicAccessToken" SET NOT NULL;

CREATE UNIQUE INDEX "Ticket_publicAccessToken_key" ON "Ticket"("publicAccessToken");

-- AlterTable
ALTER TABLE "public"."FileAttachment" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

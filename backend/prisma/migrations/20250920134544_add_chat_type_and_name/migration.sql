-- AlterTable
ALTER TABLE "public"."Chat" ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'MY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';

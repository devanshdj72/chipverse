/*
  Warnings:

  - Added the required column `subLevelType` to the `Resource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SubLevelType" AS ENUM ('CONCEPT', 'SYNTAX', 'WALKTHROUGH', 'LAB', 'QUIZ');

-- DropIndex
DROP INDEX "Resource_isActive_idx";

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "subLevelType" "SubLevelType" NOT NULL;

-- CreateIndex
CREATE INDEX "Resource_domain_levelId_subLevelType_idx" ON "Resource"("domain", "levelId", "subLevelType");

-- CreateIndex
CREATE INDEX "Resource_status_idx" ON "Resource"("status");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

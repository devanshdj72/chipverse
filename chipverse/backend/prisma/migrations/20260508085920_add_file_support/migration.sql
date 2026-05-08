-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "fileData" TEXT,
ADD COLUMN     "fileName" TEXT,
ALTER COLUMN "url" SET DEFAULT '';

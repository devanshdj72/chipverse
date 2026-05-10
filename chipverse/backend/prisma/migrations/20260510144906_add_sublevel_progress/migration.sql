-- CreateTable
CREATE TABLE "SubLevelProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "completedSubLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubLevelProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubLevelProgress_userId_idx" ON "SubLevelProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubLevelProgress_userId_domainId_key" ON "SubLevelProgress"("userId", "domainId");

-- AddForeignKey
ALTER TABLE "SubLevelProgress" ADD CONSTRAINT "SubLevelProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

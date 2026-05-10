-- CreateTable
CREATE TABLE "DomainReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "reportData" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainReport_shareToken_key" ON "DomainReport"("shareToken");

-- CreateIndex
CREATE INDEX "DomainReport_userId_idx" ON "DomainReport"("userId");

-- CreateIndex
CREATE INDEX "DomainReport_shareToken_idx" ON "DomainReport"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "DomainReport_userId_domainId_key" ON "DomainReport"("userId", "domainId");

-- AddForeignKey
ALTER TABLE "DomainReport" ADD CONSTRAINT "DomainReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

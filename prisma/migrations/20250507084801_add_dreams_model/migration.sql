/*
  Warnings:

  - You are about to drop the column `pairedWithMood` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `userMood` on the `Connection` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DreamCategory" AS ENUM ('TRAVEL', 'HOME', 'FAMILY', 'CAREER', 'ADVENTURE', 'RELATIONSHIP', 'FINANCE', 'HEALTH', 'OTHER');

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "pairedWithMood",
DROP COLUMN "userMood";

-- CreateTable
CREATE TABLE "Dream" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "category" "DreamCategory" NOT NULL DEFAULT 'OTHER',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dreamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DreamComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamComment" ADD CONSTRAINT "DreamComment_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamComment" ADD CONSTRAINT "DreamComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

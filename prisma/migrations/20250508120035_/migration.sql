/*
  Warnings:

  - You are about to drop the column `images` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the column `isUnlocked` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the column `unlockDate` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the `CapsuleComment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openDate` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_userId_fkey";

-- AlterTable
ALTER TABLE "TimeCapsule" DROP COLUMN "images",
DROP COLUMN "isUnlocked",
DROP COLUMN "unlockDate",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isOpened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "openedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "CapsuleComment";

-- CreateTable
CREATE TABLE "TimeCapsuleComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timeCapsuleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TimeCapsuleComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeCapsuleComment" ADD CONSTRAINT "TimeCapsuleComment_timeCapsuleId_fkey" FOREIGN KEY ("timeCapsuleId") REFERENCES "TimeCapsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeCapsuleComment" ADD CONSTRAINT "TimeCapsuleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

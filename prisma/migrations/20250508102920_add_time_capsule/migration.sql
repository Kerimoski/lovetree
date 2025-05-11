/*
  Warnings:

  - You are about to drop the column `capsuleId` on the `CapsuleComment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CapsuleComment` table. All the data in the column will be lost.
  - You are about to drop the column `isOpened` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the column `openDate` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `TimeCapsule` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `CapsuleComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeCapsuleId` to the `CapsuleComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CapsuleComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unlockDate` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_userId_fkey";

-- AlterTable
ALTER TABLE "CapsuleComment" DROP COLUMN "capsuleId",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "timeCapsuleId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TimeCapsule" DROP COLUMN "isOpened",
DROP COLUMN "openDate",
DROP COLUMN "openedAt",
ADD COLUMN     "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "unlockReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_timeCapsuleId_fkey" FOREIGN KEY ("timeCapsuleId") REFERENCES "TimeCapsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `authorId` on the `CapsuleComment` table. All the data in the column will be lost.
  - You are about to drop the column `timeCapsuleId` on the `CapsuleComment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CapsuleComment` table. All the data in the column will be lost.
  - You are about to drop the column `unlockDate` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the column `unlockReason` on the `TimeCapsule` table. All the data in the column will be lost.
  - Added the required column `capsuleId` to the `CapsuleComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CapsuleComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unlockAt` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_timeCapsuleId_fkey";

-- AlterTable
ALTER TABLE "CapsuleComment" DROP COLUMN "authorId",
DROP COLUMN "timeCapsuleId",
DROP COLUMN "updatedAt",
ADD COLUMN     "capsuleId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimeCapsule" DROP COLUMN "unlockDate",
DROP COLUMN "unlockReason",
ADD COLUMN     "unlockAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "TimeCapsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

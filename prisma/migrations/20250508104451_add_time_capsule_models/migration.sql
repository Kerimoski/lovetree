/*
  Warnings:

  - You are about to drop the column `unlockAt` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the `TimeCapsuleComment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unlockDate` to the `TimeCapsule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimeCapsuleComment" DROP CONSTRAINT "TimeCapsuleComment_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "TimeCapsuleComment" DROP CONSTRAINT "TimeCapsuleComment_userId_fkey";

-- AlterTable
ALTER TABLE "TimeCapsule" DROP COLUMN "unlockAt",
ADD COLUMN     "unlockDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "TimeCapsuleComment";

-- CreateTable
CREATE TABLE "CapsuleComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CapsuleComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "TimeCapsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapsuleComment" ADD CONSTRAINT "CapsuleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

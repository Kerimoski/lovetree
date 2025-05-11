/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `TimeCapsule` table. All the data in the column will be lost.
  - You are about to drop the `CapsuleComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_capsuleId_fkey";

-- DropForeignKey
ALTER TABLE "CapsuleComment" DROP CONSTRAINT "CapsuleComment_userId_fkey";

-- AlterTable
ALTER TABLE "TimeCapsule" DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "CapsuleComment";

-- CreateTable
CREATE TABLE "TimeCapsuleComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TimeCapsuleComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeCapsuleComment" ADD CONSTRAINT "TimeCapsuleComment_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "TimeCapsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeCapsuleComment" ADD CONSTRAINT "TimeCapsuleComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

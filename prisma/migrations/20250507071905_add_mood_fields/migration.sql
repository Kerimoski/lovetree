/*
  Warnings:

  - You are about to drop the column `moodStatus` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "pairedWithMood" INTEGER,
ADD COLUMN     "userMood" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "moodStatus";

-- DropEnum
DROP TYPE "MoodStatus";

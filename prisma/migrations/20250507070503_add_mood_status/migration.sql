-- CreateEnum
CREATE TYPE "MoodStatus" AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'SAD', 'VERY_SAD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "moodStatus" "MoodStatus" DEFAULT 'NEUTRAL';

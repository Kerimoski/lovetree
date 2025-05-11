-- AlterTable
ALTER TABLE "Connection" ALTER COLUMN "pairedWithId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tree" ADD COLUMN     "growthXP" INTEGER NOT NULL DEFAULT 0;

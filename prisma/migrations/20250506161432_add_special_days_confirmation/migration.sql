-- AlterTable
ALTER TABLE "SpecialDay" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;

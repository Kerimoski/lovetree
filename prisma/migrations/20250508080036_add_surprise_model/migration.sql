-- CreateTable
CREATE TABLE "Surprise" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSeenByAuthor" BOOLEAN NOT NULL DEFAULT false,
    "isSeenByPartner" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,

    CONSTRAINT "Surprise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Surprise" ADD CONSTRAINT "Surprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surprise" ADD CONSTRAINT "Surprise_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

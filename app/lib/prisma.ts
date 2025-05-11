import { PrismaClient } from '@/app/generated/prisma';

// Prisma istemcisi için global değişken
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Geliştirme ortamında birden fazla Prisma Client örneği oluşturmasını önlemek için
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 
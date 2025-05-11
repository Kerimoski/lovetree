import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { prisma } from '@/app/lib/prisma';

// Kullanıcının aktif bağlantısını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // params'ı await et
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    // Güvenlik kontrolü - yalnızca kendi kullanıcı ID'sine erişebilir
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Bu kullanıcı bilgilerine erişim izniniz yok' }, { status: 403 });
    }

    // Kullanıcının aktif bir bağlantısını bul
    // 1. Kullanıcının oluşturduğu ve eşleşmiş bağlantılar
    // 2. Kullanıcının eşleştiği bağlantılar
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { 
            userId: userId,
            pairedWithId: { not: null } // Eşleşmiş olmalı
          },
          { 
            pairedWithId: userId 
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        pairedWith: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tree: true
      }
    });

    return NextResponse.json({ connection });
    
  } catch (error) {
    console.error('Aktif bağlantı getirme hatası:', error);
    return NextResponse.json({ error: 'Aktif bağlantı getirilemedi' }, { status: 500 });
  }
} 
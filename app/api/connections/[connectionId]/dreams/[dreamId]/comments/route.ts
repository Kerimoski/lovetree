import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { prisma } from '@/app/lib/prisma';

// Yeni yorum ekle - POST isteği
export async function POST(
  request: Request,
  { params }: { params: { connectionId: string, dreamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // params objesini await ile çözümleme
    const { connectionId, dreamId } = await params;
    
    // Bağlantıyı doğrula
    const connection = await prisma.connection.findUnique({
      where: {
        id: connectionId,
        OR: [
          { userId: session.user.id },
          { pairedWithId: session.user.id }
        ]
      }
    });
    
    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 });
    }
    
    // Hayali doğrula
    const dream = await prisma.dream.findUnique({
      where: {
        id: dreamId,
        connectionId
      }
    });
    
    if (!dream) {
      return NextResponse.json({ error: 'Hayal bulunamadı' }, { status: 404 });
    }
    
    // Request gövdesini al
    const { content } = await request.json();
    
    // Gerekli alanları kontrol et
    if (!content) {
      return NextResponse.json({ error: 'Yorum içeriği gereklidir' }, { status: 400 });
    }
    
    // Yeni yorum oluştur
    const newComment = await prisma.dreamComment.create({
      data: {
        content,
        userId: session.user.id,
        dreamId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    // Ayrıca ilişkiyi sulamalıyız (ağacın büyümesine katkı sağlar)
    await prisma.tree.update({
      where: { connectionId },
      data: { 
        lastWatered: new Date(),
        growthXP: { increment: 5 } // Yorum eklemek 5 XP kazandırır
      }
    });
    
    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Yorum eklenirken hata oluştu:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 
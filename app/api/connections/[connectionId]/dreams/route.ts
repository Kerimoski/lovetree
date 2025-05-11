import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { prisma } from '@/app/lib/prisma';

// Hayalleri getir - GET isteği
export async function GET(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // params objesini await ile çözümleme
    const { connectionId } = await params;
    
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
    
    // Hayalleri getir
    const dreams = await prisma.dream.findMany({
      where: {
        connectionId: connectionId
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    
    return NextResponse.json(dreams);
  } catch (error) {
    console.error('Hayaller getirilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// Yeni hayal ekle - POST isteği
export async function POST(
  request: Request,
  { params }: { params: { connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // params objesini await ile çözümleme
    const { connectionId } = await params;
    
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
    
    // Request gövdesini al
    const { title, description, imageUrl, linkUrl, category } = await request.json();
    
    // Gerekli alanları kontrol et
    if (!title || !description) {
      return NextResponse.json({ error: 'Başlık ve açıklama gereklidir' }, { status: 400 });
    }
    
    // En son hayalin pozisyonunu bul, yeni hayali en üste eklemek için
    const lastDream = await prisma.dream.findFirst({
      where: { connectionId },
      orderBy: { position: 'desc' }
    });
    
    const newPosition = lastDream ? lastDream.position + 1 : 0;
    
    // Yeni hayal oluştur
    const newDream = await prisma.dream.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        category: category || 'OTHER',
        position: newPosition,
        userId: session.user.id,
        connectionId
      }
    });
    
    // Ayrıca ilişkiyi sulamalıyız (ağacın büyümesine katkı sağlar)
    await prisma.tree.update({
      where: { connectionId },
      data: { 
        lastWatered: new Date(),
        growthXP: { increment: 15 } // Hayal eklemek 15 XP kazandırır
      }
    });
    
    return NextResponse.json(newDream);
  } catch (error) {
    console.error('Hayal eklenirken hata oluştu:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 
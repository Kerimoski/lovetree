import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Yeni yorum ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string; capsuleId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const params2 = await params;
    const connectionId = params2.connectionId;
    const capsuleId = params2.capsuleId;

    if (!connectionId || !capsuleId) {
      return NextResponse.json({ error: 'Bağlantı ID ve Kapsül ID gerekli' }, { status: 400 });
    }

    // Kullanıcının bu bağlantıya erişimi olup olmadığını kontrol et
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { userId: session.user.id },
          { pairedWithId: session.user.id }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }

    // Kapsülün var olup olmadığını kontrol et
    const timeCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
      }
    });

    if (!timeCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Yorum içeriğini al
    const { content } = await request.json();

    // Bilgi kontrolü
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Geçerli bir yorum içeriği gerekli' }, { status: 400 });
    }

    // Yeni yorum oluştur
    const newComment = await prisma.timeCapsuleComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        timeCapsuleId: capsuleId
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

    return NextResponse.json(newComment, { status: 201 });
    
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 });
  }
}

// Yorumları getir
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string; capsuleId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const params2 = await params;
    const connectionId = params2.connectionId;
    const capsuleId = params2.capsuleId;

    if (!connectionId || !capsuleId) {
      return NextResponse.json({ error: 'Bağlantı ID ve Kapsül ID gerekli' }, { status: 400 });
    }

    // Kullanıcının bu bağlantıya erişimi olup olmadığını kontrol et
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [
          { userId: session.user.id },
          { pairedWithId: session.user.id }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }

    // Kapsülün var olup olmadığını kontrol et
    const timeCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
      }
    });

    if (!timeCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Yorumları getir
    const comments = await prisma.timeCapsuleComment.findMany({
      where: {
        timeCapsuleId: capsuleId
      },
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
    });

    return NextResponse.json(comments);
    
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    return NextResponse.json({ error: 'Yorumlar getirilemedi' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Chat mesajlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { connectionId } = resolvedParams;

    if (!connectionId) {
      return NextResponse.json({ error: 'Bağlantı ID gerekli' }, { status: 400 });
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

    // Mesajları getir
    const messages = await prisma.chatMessage.findMany({
      where: {
        connectionId
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

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.chatMessage.updateMany({
      where: {
        connectionId,
        userId: {
          not: session.user.id
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json(messages);
    
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    return NextResponse.json({ error: 'Mesajlar getirilemedi' }, { status: 500 });
  }
}

// Yeni mesaj oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { connectionId } = resolvedParams;

    if (!connectionId) {
      return NextResponse.json({ error: 'Bağlantı ID gerekli' }, { status: 400 });
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

    // Mesaj içeriğini al
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Geçerli bir mesaj içeriği gerekli' }, { status: 400 });
    }

    // Yeni mesaj oluştur
    const newMessage = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        connectionId,
        isRead: false
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

    return NextResponse.json(newMessage, { status: 201 });
    
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    return NextResponse.json({ error: 'Mesaj oluşturulamadı' }, { status: 500 });
  }
} 
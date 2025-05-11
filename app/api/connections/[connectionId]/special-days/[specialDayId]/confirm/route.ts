import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Özel günü onayla
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string, specialDayId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // params'ı await et
    const resolvedParams = await params;
    const { connectionId, specialDayId } = resolvedParams;

    if (!connectionId || !specialDayId) {
      return NextResponse.json({ error: 'Bağlantı ID ve özel gün ID gerekli' }, { status: 400 });
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

    // Özel günü bul
    const specialDay = await prisma.specialDay.findFirst({
      where: {
        id: specialDayId,
        connectionId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!specialDay) {
      return NextResponse.json({ error: 'Özel gün bulunamadı' }, { status: 404 });
    }

    // Kullanıcı kendi oluşturduğu özel günü onaylayamaz
    if (specialDay.userId === session.user.id) {
      return NextResponse.json({ 
        error: 'Kendi oluşturduğunuz özel günü onaylayamazsınız' 
      }, { status: 400 });
    }

    // Özel gün zaten onaylanmışsa hata ver
    if (specialDay.isConfirmed) {
      return NextResponse.json({ 
        error: 'Bu özel gün zaten onaylanmış' 
      }, { status: 400 });
    }

    // Özel günü onayla
    const updatedSpecialDay = await prisma.specialDay.update({
      where: { id: specialDayId },
      data: {
        isConfirmed: true,
        confirmedById: session.user.id,
        confirmedAt: new Date()
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

    // Bugünün tarihi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Özel gün tarihi
    const eventDate = new Date(updatedSpecialDay.date);
    eventDate.setHours(0, 0, 0, 0);
    
    // Kalan gün hesapla
    const diffTime = eventDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      ...updatedSpecialDay,
      daysLeft: daysLeft,
      isPast: daysLeft < 0,
      isToday: daysLeft === 0,
      message: `${specialDay.title} özel gününe katılımınız onaylandı!`
    });
    
  } catch (error) {
    console.error('Özel gün onaylama hatası:', error);
    return NextResponse.json({ error: 'Özel gün onaylanamadı' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Belirli bir zaman kapsülünü getir
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

    // Zaman kapsülünü getir
    const timeCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
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

    if (!timeCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Kapsülün açılma zamanı gelmedi ve açılmamışsa içeriği gizle
    const now = new Date();
    const shouldHideContent = !timeCapsule.isOpened && timeCapsule.openDate > now;
    
    const responseData = shouldHideContent 
      ? {
          ...timeCapsule,
          content: null, // İçeriği gizle
          hiddenUntil: timeCapsule.openDate
        }
      : timeCapsule;

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Zaman kapsülünü getirme hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülü getirilemedi' }, { status: 500 });
  }
}

// Zaman kapsülünü güncelle
export async function PUT(
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

    // Kapsülün var olup olmadığını ve kullanıcının sahibi olup olmadığını kontrol et
    const existingCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
      }
    });

    if (!existingCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Sadece kapsülün sahibi güncelleyebilir
    if (existingCapsule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu kapsülü düzenleme yetkiniz yok' }, { status: 403 });
    }

    // Kapsül açılmışsa güncellenemez
    if (existingCapsule.isOpened) {
      return NextResponse.json({ error: 'Açılmış kapsüller düzenlenemez' }, { status: 400 });
    }

    // Güncelleme verilerini al
    const { title, description, content, imageUrl, openDate } = await request.json();

    // Güncelleme verilerini kontrol et
    if (!title && !description && !content && imageUrl === undefined && !openDate) {
      return NextResponse.json({ error: 'Güncellenecek en az bir alan gerekli' }, { status: 400 });
    }

    // Güncelleme nesnesi oluştur
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (content) updateData.content = content;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Açılış tarihi güncellenmek isteniyorsa kontrol et
    if (openDate) {
      const openDateObj = new Date(openDate);
      const now = new Date();
      
      if (openDateObj <= now) {
        return NextResponse.json({ 
          error: 'Açılış tarihi gelecekte olmalıdır' 
        }, { status: 400 });
      }
      
      updateData.openDate = openDateObj;
    }

    // Kapsülü güncelle
    const updatedCapsule = await prisma.timeCapsule.update({
      where: {
        id: capsuleId
      },
      data: updateData
    });

    return NextResponse.json({
      ...updatedCapsule,
      message: "Zaman kapsülü başarıyla güncellendi"
    });
    
  } catch (error) {
    console.error('Zaman kapsülünü güncelleme hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülü güncellenemedi' }, { status: 500 });
  }
}

// Zaman kapsülünü aç
export async function PATCH(
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
    const existingCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
      }
    });

    if (!existingCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Kapsül zaten açılmışsa hata döndür
    if (existingCapsule.isOpened) {
      return NextResponse.json({ error: 'Bu kapsül zaten açılmış' }, { status: 400 });
    }

    // Kapsülün açılma zamanı geldi mi kontrol et
    const now = new Date();
    const openDate = new Date(existingCapsule.openDate);

    if (openDate > now) {
      return NextResponse.json({ 
        error: 'Bu kapsülün açılma zamanı henüz gelmedi',
        openDate: openDate
      }, { status: 400 });
    }

    // Kapsülü aç
    const openedCapsule = await prisma.timeCapsule.update({
      where: {
        id: capsuleId
      },
      data: {
        isOpened: true,
        openedAt: now
      }
    });

    return NextResponse.json({
      ...openedCapsule,
      message: "Zaman kapsülü başarıyla açıldı"
    });
    
  } catch (error) {
    console.error('Zaman kapsülünü açma hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülü açılamadı' }, { status: 500 });
  }
}

// Zaman kapsülünü sil
export async function DELETE(
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

    // Kapsülün var olup olmadığını ve kullanıcının sahibi olup olmadığını kontrol et
    const existingCapsule = await prisma.timeCapsule.findUnique({
      where: {
        id: capsuleId,
        connectionId: connectionId
      }
    });

    if (!existingCapsule) {
      return NextResponse.json({ error: 'Zaman kapsülü bulunamadı' }, { status: 404 });
    }

    // Sadece kapsülün sahibi silebilir
    if (existingCapsule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu kapsülü silme yetkiniz yok' }, { status: 403 });
    }

    // Kapsülü sil
    await prisma.timeCapsule.delete({
      where: {
        id: capsuleId
      }
    });

    return NextResponse.json({
      message: "Zaman kapsülü başarıyla silindi"
    });
    
  } catch (error) {
    console.error('Zaman kapsülünü silme hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülü silinemedi' }, { status: 500 });
  }
} 
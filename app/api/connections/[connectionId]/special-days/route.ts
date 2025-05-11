import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Ağacı direkt güncelleme işlemi (API çağrısı yerine doğrudan DB'ye erişim)
async function directUpdateTree(connectionId: string) {
  try {
    console.log('Ağaç direkt güncelleniyor (DB):', connectionId);
    
    // Ağacı bul
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId },
      include: { tree: true }
    });
    
    if (!connection || !connection.tree) {
      console.error('Ağaç bulunamadı veya bağlantıda ağaç yok');
      return null;
    }
    
    // XP miktarı (özel gün için 25 XP)
    const xpToAdd = 25;
    
    // Mevcut değerler
    const currentXP = connection.tree.growthXP || 0;
    const newXP = currentXP + xpToAdd;
    const currentLevel = connection.tree.growthLevel;
    
    // Seviye hesapla (her 1000 XP'de bir seviye)
    const XP_PER_LEVEL = 1000;
    const maxLevel = 3;
    
    console.log('Ağaç güncelleme öncesi durum:', {
      treeId: connection.tree.id, 
      currentXP, 
      newXP,
      currentLevel, 
      xpToAdd
    });
    
    // Yeni seviye hesapla (1'den başlayarak)
    let newLevel = currentLevel;
    if (currentLevel < maxLevel) {
      newLevel = Math.min(maxLevel, Math.floor(newXP / XP_PER_LEVEL) + 1);
      console.log(`Seviye hesaplaması: Math.floor(${newXP} / ${XP_PER_LEVEL}) + 1 = ${newLevel}`);
    }
    
    const hasLeveledUp = newLevel > currentLevel;
    
    if (hasLeveledUp) {
      console.log(`SEVİYE ATLADI! ${currentLevel} -> ${newLevel}`);
    }
    
    console.log('Ağaç güncelleme bilgileri:', {
      treeId: connection.tree.id,
      currentXP,
      newXP,
      currentLevel,
      newLevel,
      hasLevelUp: newLevel > currentLevel
    });
    
    // Ağacı güncelle
    const updatedTree = await prisma.tree.update({
      where: { id: connection.tree.id },
      data: {
        growthLevel: newLevel,
        growthXP: newXP,
        lastWatered: new Date()
      }
    });
    
    console.log('Ağaç başarıyla güncellendi:', {
      treeId: updatedTree.id,
      newLevel: updatedTree.growthLevel,
      newXP: updatedTree.growthXP
    });
    
    return {
      success: true,
      tree: updatedTree,
      leveledUp: newLevel > currentLevel,
      xpAdded: xpToAdd
    };
  } catch (error) {
    console.error('Ağaç direkt güncelleme hatası:', error);
    return null;
  }
}

// Tüm özel günleri getir
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

    // params'ı await et
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

    // Bağlantıya ait özel günleri getir
    const specialDays = await prisma.specialDay.findMany({
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
        date: 'asc'
      }
    });

    // Bugünün tarihi
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Her özel gün için kalan gün hesapla
    const specialDaysWithDaysLeft = specialDays.map(day => {
      // Tarihin saat, dakika ve saniyelerini sıfırla
      const eventDate = new Date(day.date);
      eventDate.setHours(0, 0, 0, 0);
      
      // Milisaniye cinsinden farkı hesapla ve gün sayısına çevir
      const diffTime = eventDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...day,
        daysLeft: daysLeft,
        isPast: daysLeft < 0,
        isToday: daysLeft === 0
      };
    });

    return NextResponse.json(specialDaysWithDaysLeft);
    
  } catch (error) {
    console.error('Özel günleri getirme hatası:', error);
    return NextResponse.json({ error: 'Özel günler getirilemedi' }, { status: 500 });
  }
}

// Yeni özel gün oluştur
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

    // params'ı await et
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

    // Özel gün bilgilerini al
    const body = await request.json();
    console.log('Alınan API isteği body:', body);
    
    const { title, description, date, isRecurring } = body;

    // Bilgi kontrolü
    if (!title || !date) {
      console.error('Eksik veri:', { title, date });
      return NextResponse.json({ 
        error: 'Başlık ve tarih gereklidir' 
      }, { status: 400 });
    }

    // Yeni özel gün oluştur
    console.log('Özel gün oluşturuluyor:', { title, userId: session.user.id, connectionId });
    try {
      const newSpecialDay = await prisma.specialDay.create({
        data: {
          title,
          description: description || null,
          date: new Date(date),
          isRecurring: isRecurring ?? true, // Varsayılan olarak tekrarlanan
          userId: session.user.id,
          connectionId,
          isConfirmed: false, // Başlangıçta onaylanmamış
          confirmedById: null,
          confirmedAt: null
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
      
      console.log('Özel gün başarıyla oluşturuldu:', newSpecialDay.id);

      // Özel gün oluşturulduktan sonra ağacı sula
      directUpdateTree(connectionId)
        .then(result => {
          if (result && result.leveledUp) {
            console.log(`Ağaç sulama başarılı ve seviye atladı! Yeni seviye: ${result.tree.growthLevel}`);
          } else if (result) {
            console.log('Ağaç sulama başarılı.');
          }
        })
        .catch(error => {
          console.error('Ağaç sulama işlemi başarısız:', error);
        });
        
      // Bugünün tarihi
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Özel gün tarihi
      const eventDate = new Date(date);
      eventDate.setHours(0, 0, 0, 0);
      
      // Kalan gün hesapla
      const diffTime = eventDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return NextResponse.json({
        ...newSpecialDay,
        daysLeft: daysLeft,
        isPast: daysLeft < 0,
        isToday: daysLeft === 0,
        message: "Özel gün başarıyla oluşturuldu ve ağacınız sulandı."
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Özel gün oluşturma veritabanı hatası:', dbError);
      return NextResponse.json({ error: 'Özel gün oluşturulamadı: ' + dbError.message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Özel gün oluşturma hatası:', error);
    return NextResponse.json({ error: 'Özel gün oluşturulamadı' }, { status: 500 });
  }
} 
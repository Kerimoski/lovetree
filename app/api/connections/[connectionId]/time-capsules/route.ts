import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Bir bağlantıya ait tüm zaman kapsüllerini getir
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

    const params2 = await params;
    const connectionId = params2.connectionId;

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

    // Bağlantıya ait zaman kapsüllerini getir
    const timeCapsules = await prisma.timeCapsule.findMany({
      where: {
        connectionId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return NextResponse.json(timeCapsules);
    
  } catch (error) {
    console.error('Zaman kapsüllerini getirme hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülleri getirilemedi' }, { status: 500 });
  }
}

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
    
    // XP miktarı (zaman kapsülü için 40 XP)
    const xpToAdd = 40;
    
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

// Yeni zaman kapsülü oluştur
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

    const params2 = await params;
    const connectionId = params2.connectionId;

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

    // Zaman kapsülü bilgilerini al
    const { title, description, content, imageUrl, openDate } = await request.json();

    // Bilgi kontrolü
    if (!title || !description || !content || !openDate) {
      return NextResponse.json({ 
        error: 'Başlık, açıklama, içerik ve açılış tarihi gereklidir' 
      }, { status: 400 });
    }

    // Açılış tarihinin geçerli bir gelecek tarih olup olmadığını kontrol et
    const openDateObj = new Date(openDate);
    const now = new Date();
    
    if (openDateObj <= now) {
      return NextResponse.json({ 
        error: 'Açılış tarihi gelecekte olmalıdır' 
      }, { status: 400 });
    }

    // Yeni zaman kapsülü oluştur
    console.log('Zaman kapsülü oluşturuluyor:', { title, userId: session.user.id, connectionId });
    try {
      const newTimeCapsule = await prisma.timeCapsule.create({
        data: {
          title,
          description,
          content,
          imageUrl: imageUrl || null,
          openDate: openDateObj,
          userId: session.user.id,
          connectionId
        }
      });
      
      console.log('Zaman kapsülü başarıyla oluşturuldu:', newTimeCapsule.id);

      // Zaman kapsülü oluşturulduktan sonra ağacı sula
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

      return NextResponse.json({
        ...newTimeCapsule,
        message: "Zaman kapsülü başarıyla oluşturuldu ve ağacınız sulandı."
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Zaman kapsülü oluşturma veritabanı hatası:', dbError);
      return NextResponse.json({ error: 'Zaman kapsülü oluşturulamadı: ' + dbError.message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Zaman kapsülü oluşturma hatası:', error);
    return NextResponse.json({ error: 'Zaman kapsülü oluşturulamadı' }, { status: 500 });
  }
} 
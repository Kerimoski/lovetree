import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Bir bağlantıya ait tüm anıları getir
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

    const connectionId = params.connectionId;

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

    // Bağlantıya ait anıları getir
    const memories = await prisma.memory.findMany({
      where: {
        connectionId
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(memories);
    
  } catch (error) {
    console.error('Anıları getirme hatası:', error);
    return NextResponse.json({ error: 'Anılar getirilemedi' }, { status: 500 });
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
    
    // XP miktarı (anı için 15 XP)
    const xpToAdd = 15;
    
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

// Yeni anı oluştur
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
    const connectionId = resolvedParams.connectionId;

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

    // Anı bilgilerini al
    const { title, description, imageUrl, date } = await request.json();

    // Bilgi kontrolü
    if (!title || !description || !date) {
      return NextResponse.json({ 
        error: 'Başlık, açıklama ve tarih gereklidir' 
      }, { status: 400 });
    }

    // Yeni anı oluştur
    console.log('Anı oluşturuluyor:', { title, userId: session.user.id, connectionId });
    try {
      const newMemory = await prisma.memory.create({
        data: {
          title,
          description,
          imageUrl: imageUrl || null,
          date: new Date(date),
          userId: session.user.id,
          connectionId
        }
      });
      
      console.log('Anı başarıyla oluşturuldu:', newMemory.id);

      // Anı oluşturulduktan sonra ağacı sula (artık HTTP API yerine direkt DB güncelleme kullan)
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
        ...newMemory,
        message: "Anı başarıyla oluşturuldu ve ağacınız sulandı."
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Anı oluşturma veritabanı hatası:', dbError);
      return NextResponse.json({ error: 'Anı oluşturulamadı: ' + dbError.message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Anı oluşturma hatası:', error);
    return NextResponse.json({ error: 'Anı oluşturulamadı' }, { status: 500 });
  }
} 
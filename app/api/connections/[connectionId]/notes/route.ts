import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Bağlantıya ait notları getir
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

    // Bağlantıya ait notları getir
    const notes = await prisma.note.findMany({
      where: {
        connectionId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notes);
    
  } catch (error) {
    console.error('Notları getirme hatası:', error);
    return NextResponse.json({ error: 'Notlar getirilemedi' }, { status: 500 });
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
    
    // XP miktarı (not için 10 XP)
    const xpToAdd = 10;
    
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

// Yeni not oluştur
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

    // Not bilgilerini al
    const body = await request.json();
    console.log('Alınan API isteği body:', body);
    
    const { title, content } = body;

    // Bilgi kontrolü
    if (!title || !content) {
      console.error('Eksik veri:', { title, content });
      return NextResponse.json({ 
        error: 'Başlık ve içerik gereklidir' 
      }, { status: 400 });
    }

    // Yeni not oluştur
    console.log('Not oluşturuluyor:', { title, authorId: session.user.id, connectionId });
    try {
      const newNote = await prisma.note.create({
        data: {
          title,
          content,
          authorId: session.user.id,
          connectionId,
          isTemporary: false // Kalıcı not olarak ayarla
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });
      
      console.log('Not başarıyla oluşturuldu:', newNote.id);

      // Not oluşturulduktan sonra ağacı sula (direkt DB yöntemini kullanarak)
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
        ...newNote,
        message: "Not başarıyla oluşturuldu ve ağacınız sulandı."
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Not oluşturma veritabanı hatası:', dbError);
      return NextResponse.json({ error: 'Not oluşturulamadı: ' + dbError.message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Not oluşturma hatası:', error);
    return NextResponse.json({ error: 'Not oluşturulamadı' }, { status: 500 });
  }
} 
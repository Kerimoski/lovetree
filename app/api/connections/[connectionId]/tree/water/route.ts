import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Farklı işlemlerin XP değerleri
export const XP_VALUES = {
  MEMORY: 15,       // Anı eklemek
  NOTE: 10,         // Not eklemek
  LOGIN: 5,         // Giriş yapmak
  SPECIAL_DAY: 25   // Özel gün eklemek
};

// Seviye atlamak için gereken XP
const XP_PER_LEVEL = 1000;

// Ağacı sula ve gerekirse seviyesini artır
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
      },
      include: {
        tree: true
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }

    // İşlem tipini ve eklenecek XP'yi belirle
    let actionType = 'MEMORY'; // Varsayılan olarak anı eklemek
    
    try {
      // Body'den actionType'ı almaya çalış
      const body = await request.json();
      actionType = body.actionType || 'MEMORY';
      console.log('İşlem tipi:', actionType);
    } catch (e) {
      // JSON parse hatası varsa varsayılan değeri kullan
      console.log('Body ayrıştırma hatası, varsayılan işlem tipi kullanılacak (MEMORY)');
    }
    
    // XP değerini belirle
    const xpToAdd = XP_VALUES[actionType as keyof typeof XP_VALUES] || XP_VALUES.MEMORY;
    console.log(`Eklenecek XP: ${xpToAdd}`);

    // Ağaç yoksa oluştur
    if (!connection.tree) {
      console.log('Ağaç bulunamadı, yeni ağaç oluşturuluyor.');
      const newTree = await prisma.tree.create({
        data: {
          connectionId,
          growthLevel: 1,
          growthXP: xpToAdd,
          lastWatered: new Date()
        }
      });

      console.log('Yeni ağaç oluşturuldu:', newTree);
      return NextResponse.json({
        success: true, 
        message: "Yeni ağaç oluşturuldu ve sulandı",
        tree: newTree,
        xpAdded: xpToAdd
      });
    }

    // Maksimum seviye (3)
    const maxLevel = 3;
    
    // Mevcut XP'yi güncelle
    let currentXP = connection.tree.growthXP || 0;
    let newXP = currentXP + xpToAdd;
    
    // Güncel seviye
    let currentLevel = connection.tree.growthLevel;
    
    // Debug için detaylı bilgiler logla
    console.log('Sulama öncesi ağaç durumu:', {
      treeId: connection.tree.id,
      currentLevel,
      currentXP,
      newXP: currentXP + xpToAdd,
      xpToAdd
    });
    
    // XP'ye göre seviye hesapla
    // Seviye 1'den başlar
    let newLevel = currentLevel;
    
    if (currentLevel < maxLevel) {
      // XP'ye göre yeni seviyeyi hesapla
      newLevel = Math.min(maxLevel, Math.floor(newXP / XP_PER_LEVEL) + 1);
      console.log(`Seviye hesaplaması: Math.floor(${newXP} / ${XP_PER_LEVEL}) + 1 = ${newLevel}`);
    }
    
    // Levelup durumu
    const hasLeveledUp = newLevel > currentLevel;
    
    if (hasLeveledUp) {
      console.log(`SEVİYE ATLADI! ${currentLevel} -> ${newLevel}`);
    }

    // Ağacı güncelle
    const updatedTree = await prisma.tree.update({
      where: { id: connection.tree.id },
      data: {
        growthLevel: newLevel,
        growthXP: newXP,
        lastWatered: new Date()
      }
    });
    
    console.log('Ağaç güncellendi:', {
      treeId: updatedTree.id,
      newLevel: updatedTree.growthLevel,
      newXP: updatedTree.growthXP,
      leveledUp: hasLeveledUp
    });

    // Bir sonraki seviye için gereken XP miktarı
    const nextLevelXP = newLevel < maxLevel 
      ? XP_PER_LEVEL * newLevel  // Bir sonraki seviye için gereken toplam XP
      : null;
    
    // Yüzde olarak ilerleme (bir sonraki seviye için)
    const progressToNextLevel = nextLevelXP 
      ? Math.min(100, Math.floor((newXP % XP_PER_LEVEL) / (XP_PER_LEVEL / 100)))
      : 100;

    return NextResponse.json({
      success: true,
      message: hasLeveledUp
        ? "Ağacınız sulandı ve seviye atladı!" 
        : "Ağacınız sulandı",
      tree: updatedTree,
      leveledUp: hasLeveledUp,
      xpAdded: xpToAdd,
      xpTotal: newXP,
      nextLevelXP: nextLevelXP,
      progressToNextLevel: progressToNextLevel
    });
    
  } catch (error) {
    console.error('Ağaç sulama hatası:', error);
    return NextResponse.json({ error: 'Ağaç sulanırken bir hata oluştu' }, { status: 500 });
  }
} 
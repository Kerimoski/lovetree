import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Bağlantı kodunu kullanarak eşleştirme
export async function POST(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { connectionCode } = await req.json();

    // Kod kontrolü
    if (!connectionCode) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir' }, { status: 400 });
    }

    // Bağlantıyı bul
    const connection = await prisma.connection.findUnique({
      where: { connectionCode },
      include: { 
        user: true,
        tree: true // Mevcut ağaç bilgisini de getir
      }
    });

    // Bağlantı bulunamadıysa hata döndür
    if (!connection) {
      return NextResponse.json({ error: 'Geçersiz bağlantı kodu' }, { status: 404 });
    }

    // Kendini kendine bağlamamak için kontrol
    if (connection.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinizi kendinize bağlayamazsınız' }, 
        { status: 400 }
      );
    }

    // Zaten eşleşmiş bir bağlantıysa hata döndür
    if (connection.pairedWithId) {
      return NextResponse.json(
        { error: 'Bu bağlantı kodu zaten kullanılmış' }, 
        { status: 400 }
      );
    }

    // Transaction içinde tüm işlemleri gerçekleştir
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mevcut bir ağaç kaydı varsa sil (temiz başlangıç için)
      if (connection.tree) {
        await tx.tree.delete({
          where: { id: connection.tree.id }
        });
        console.log(`Mevcut ağaç silindi: ${connection.tree.id}`);
      }

      // Bu bağlantı için başka ağaçlar var mı kontrol et ve sil
      // Bu, veritabanında kalabilecek orphaned ağaçları temizler
      const existingTrees = await tx.tree.findMany({
        where: { connectionId: connection.id }
      });
      
      for (const tree of existingTrees) {
        await tx.tree.delete({
          where: { id: tree.id }
        });
        console.log(`Ek ağaç silindi: ${tree.id}`);
      }

      // 2. Bağlantıyı güncelle
      const updatedConnection = await tx.connection.update({
        where: { id: connection.id },
        data: { 
          pairedWithId: session.user.id,
        },
        include: {
          user: true,
          pairedWith: true,
        }
      });
      console.log(`Bağlantı güncellendi: ${updatedConnection.id}`);

      // 3. Yeni ağaç oluştur (seviye 1'den başla)
      const newTree = await tx.tree.create({
        data: {
          connectionId: connection.id,
          growthLevel: 1,
          growthXP: 0,  // XP sıfırdan başlar
          lastWatered: new Date() // Şu anki zamanı sulama zamanı olarak ayarla
        }
      });
      console.log(`Yeni ağaç oluşturuldu: ${newTree.id}, Seviye: ${newTree.growthLevel}`);

      return { updatedConnection, newTree };
    });

    console.log(`Eşleştirme tamamlandı. Ağaç seviyesi: ${result.newTree.growthLevel}`);

    return NextResponse.json({
      message: 'Bağlantı başarıyla eşleştirildi',
      connection: result.updatedConnection,
      tree: result.newTree
    });

  } catch (error) {
    console.error('Bağlantı eşleştirme hatası:', error);
    return NextResponse.json({ error: 'Bağlantı eşleştirilemedi' }, { status: 500 });
  }
} 
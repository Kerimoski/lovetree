import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { promises as fs } from 'fs';
import path from 'path';

// Bağlantıyı kes ve ilgili tüm verileri sil
export async function DELETE(
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
        tree: true // Ağaç bilgisini de getir
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }

    // İlk olarak bağlantıya ait anılar ve resim URL'lerini al
    const memories = await prisma.memory.findMany({
      where: { connectionId },
      select: { imageUrl: true }
    });
    
    // Hayaller ve resimleri al
    const dreams = await prisma.dream.findMany({
      where: { connectionId },
      select: { imageUrl: true }
    });
    
    // Zaman kapsülleri ve resimleri al
    const timeCapsules = await prisma.timeCapsule.findMany({
      where: { connectionId },
      select: { imageUrl: true }
    });

    // Tüm resim URL'lerini topla
    const imageUrls = [
      ...memories.map(memory => memory.imageUrl),
      ...dreams.map(dream => dream.imageUrl),
      ...timeCapsules.map(capsule => capsule.imageUrl)
    ].filter(url => url !== null && url.startsWith('/uploads/')) as string[];

    console.log(`Silinecek resim dosyası sayısı: ${imageUrls.length}`);

    // İşlemi bir transaction içinde gerçekleştir
    // Bu, tüm silme işlemlerinin ya hep birlikte başarılı olmasını
    // ya da hiçbirinin gerçekleşmemesini sağlar
    await prisma.$transaction(async (tx) => {
      // 1. Bağlantıya ait tüm anıları sil
      await tx.memory.deleteMany({
        where: { connectionId }
      });

      // 2. Bağlantıya ait tüm notları sil
      await tx.note.deleteMany({
        where: { connectionId }
      });

      // 3. Bağlantıya ait tüm özel günleri sil
      await tx.specialDay.deleteMany({
        where: { connectionId }
      });

      // 4. Bağlantıya ait tüm hedefleri sil
      await tx.goal.deleteMany({
        where: { connectionId }
      });
      
      // 5. Hayallere ait tüm yorumları sil
      await tx.dreamComment.deleteMany({
        where: { 
          dream: { connectionId } 
        }
      });
      
      // 6. Zaman kapsüllerine ait tüm yorumları sil
      await tx.timeCapsuleComment.deleteMany({
        where: {
          timeCapsule: { connectionId }
        }
      });
      
      // 7. Bağlantıya ait tüm zaman kapsüllerini sil
      await tx.timeCapsule.deleteMany({
        where: { connectionId }
      });
      
      // 8. Bağlantıya ait tüm hayalleri sil
      await tx.dream.deleteMany({
        where: { connectionId }
      });
      
      // 9. Bağlantıya ait ağaç kaydını sil (aynı mail ile tekrar bağlanıldığında sıfırdan başlaması için)
      if (connection.tree) {
        await tx.tree.delete({
          where: { id: connection.tree.id }
        });
      }

      // 10. Son olarak bağlantının kendisini sil
      await tx.connection.delete({
        where: { id: connectionId }
      });
    });

    // Transaction tamamlandıktan sonra, resim dosyalarını dosya sisteminden sil
    // Transaction dışında yapmamızın sebebi: dosya silme işlemi başarısız olsa bile veritabanı işleminin tamamlanmış olmasını istiyoruz
    for (const imageUrl of imageUrls) {
      try {
        // Resim URL'inden dosya adını çıkar
        const fileName = imageUrl.split('/').pop();
        
        if (fileName) {
          // Dosya yolunu oluştur
          const filePath = path.join(process.cwd(), 'public', 'uploads', 'images', fileName);
          
          // Dosyanın varlığını kontrol et ve sil
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            console.log(`Bağlantı silindi: Resim dosyası silindi: ${filePath}`);
          } catch (fileError) {
            console.warn(`Bağlantı silindi: Silinecek resim dosyası bulunamadı: ${filePath}`);
          }
        }
      } catch (fsError) {
        console.error('Resim dosyasını silme hatası:', fsError);
        // Devam et, bu hatayı görmezden gel
      }
    }

    return NextResponse.json({ success: true, message: "Bağlantı ve ilgili tüm veriler başarıyla silindi" });
    
  } catch (error) {
    console.error('Bağlantı kesme hatası:', error);
    return NextResponse.json({ error: 'Bağlantı kesilirken bir hata oluştu' }, { status: 500 });
  }
} 
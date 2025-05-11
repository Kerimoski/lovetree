import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { promises as fs } from 'fs';
import path from 'path';

// Belirli bir anıyı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string, memoryId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // params'ı await et
    const resolvedParams = await params;
    const { connectionId, memoryId } = resolvedParams;

    if (!connectionId || !memoryId) {
      return NextResponse.json({ error: 'Bağlantı ID ve Anı ID gerekli' }, { status: 400 });
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

    // Belirli anıyı getir
    const memory = await prisma.memory.findUnique({
      where: {
        id: memoryId,
        connectionId
      }
    });

    if (!memory) {
      return NextResponse.json({ error: 'Anı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(memory);
    
  } catch (error) {
    console.error('Anı detayı getirme hatası:', error);
    return NextResponse.json({ error: 'Anı detayları getirilemedi' }, { status: 500 });
  }
}

// Anı silme API'si
export async function DELETE(
  request: NextRequest,
  { params }: { params: { connectionId: string, memoryId: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // params'ı await et
    const resolvedParams = await params;
    const { connectionId, memoryId } = resolvedParams;

    if (!connectionId || !memoryId) {
      return NextResponse.json({ error: 'Bağlantı ID ve Anı ID gerekli' }, { status: 400 });
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

    // Anıyı bul
    const memory = await prisma.memory.findUnique({
      where: {
        id: memoryId,
        connectionId
      }
    });
    
    if (!memory) {
      return NextResponse.json({ error: 'Anı bulunamadı' }, { status: 404 });
    }

    // İşlemi bir transaction içinde gerçekleştir
    await prisma.$transaction(async (tx) => {
      // 1. Önce anıyı sil
      await tx.memory.delete({
        where: { id: memoryId }
      });
      
      // 2. Eğer anıya ait bir resim varsa, dosya sisteminden de sil
      if (memory.imageUrl) {
        try {
          // Resim URL'inden dosya adını çıkar
          // Örnek: /uploads/images/abc-123.jpg -> abc-123.jpg
          const fileName = memory.imageUrl.split('/').pop();
          
          if (fileName) {
            // Dosya yolunu oluştur
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'images', fileName);
            
            // Dosyanın varlığını kontrol et
            try {
              await fs.access(filePath);
              // Dosyayı sil
              await fs.unlink(filePath);
              console.log(`Resim dosyası silindi: ${filePath}`);
            } catch (fileError) {
              // Dosya bulunamadıysa sadece log tutuyoruz, işlemi durdurmuyoruz
              console.warn(`Silinecek resim dosyası bulunamadı: ${filePath}`);
            }
          }
        } catch (fsError) {
          console.error('Resim dosyasını silme hatası:', fsError);
          // Resim silme hatası olsa bile işlem devam etmeli
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Anı başarıyla silindi'
    });
    
  } catch (error) {
    console.error('Anı silme hatası:', error);
    return NextResponse.json({ error: 'Anı silinirken bir hata oluştu' }, { status: 500 });
  }
} 
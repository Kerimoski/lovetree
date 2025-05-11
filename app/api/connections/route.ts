import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { generateRandomCode } from '@/app/utils/codeGenerator';

// Kullanıcı için bağlantı kodu oluştur
export async function POST(req: Request) {
  console.log('>>> API: Bağlantı oluşturma isteği alındı');
  
  // Oturum kontrolü
  const session = await getServerSession(authOptions);
  console.log('>>> API: Oturum bilgileri:', JSON.stringify(session, null, 2));
  
  if (!session || !session.user) {
    console.log('>>> API: Oturum hatası - kullanıcı bilgisi yok');
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  }
  
  try {
    const userId = session.user.id;
    console.log('>>> API: Kullanıcı ID:', userId);
    
    // Kullanıcının mevcut bağlantı kodu var mı kontrol edilir
    const existingConnection = await prisma.connection.findFirst({
      where: {
        userId: userId,
        pairedWithId: null
      }
    });
    
    // Mevcut eşleşmemiş bağlantı varsa, onu döndür
    if (existingConnection) {
      console.log('>>> API: Mevcut bağlantı bulundu:', existingConnection.connectionCode);
      return NextResponse.json({
        connectionCode: existingConnection.connectionCode,
        message: 'Mevcut bağlantı kodu'
      });
    }
    
    // Yeni benzersiz kod oluştur
    const connectionCode = generateRandomCode();
    console.log('>>> API: Yeni bağlantı kodu oluşturuldu:', connectionCode);
    
    // Yeni bağlantı oluştur
    const newConnection = await prisma.connection.create({
      data: {
        connectionCode,
        userId,
        pairedWithId: null
      }
    });
    
    console.log('>>> API: Yeni bağlantı kaydedildi:', newConnection.id);
    
    return NextResponse.json({
      connectionCode,
      message: 'Bağlantı kodu başarıyla oluşturuldu'
    }, { status: 201 });
    
  } catch (error) {
    console.error('>>> API: Bağlantı oluşturma hatası:', error);
    return NextResponse.json({ error: 'Bağlantı kodu oluşturulamadı' }, { status: 500 });
  }
}

// Kullanıcı bağlantılarını getir
export async function GET(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    console.log('>>> GET /api/connections: Oturum kontrol ediliyor');
    
    if (!session || !session.user) {
      console.log('>>> GET /api/connections: Oturum hatası - kullanıcı yok');
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`>>> GET /api/connections: Kullanıcı ID: ${userId}`);

    // Kullanıcının bağlantılarını getir
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: userId },
          { pairedWithId: userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        pairedWith: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        tree: true
      }
    });
    
    console.log(`>>> GET /api/connections: ${connections.length} bağlantı bulundu`);
    
    // Bağlantı ID'lerini logla
    connections.forEach((conn, index) => {
      console.log(`>>> Bağlantı ${index + 1}:`, {
        id: conn.id,
        userId: conn.userId,
        pairedWithId: conn.pairedWithId,
        createdAt: conn.createdAt
      });
    });
    
    return NextResponse.json(connections);
    
  } catch (error) {
    console.error('>>> GET /api/connections: Bağlantıları getirme hatası:', error);
    return NextResponse.json({ error: 'Bağlantılar getirilemedi' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/auth/options';

// GET: Sürprizleri getir
export async function GET(
  request: NextRequest, 
  { params }: { params: { connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const connectionId = params.connectionId;
    
    // Bağlantıyı kontrol et
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        user: true,
        pairedWith: true,
      },
    });
    
    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcının bu bağlantıya erişim izni var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    if (connection.userId !== user.id && connection.pairedWithId !== user.id) {
      return NextResponse.json({ error: 'Bu bağlantıya erişim izniniz yok' }, { status: 403 });
    }
    
    // Kullanıcının görebileceği sürprizleri getir
    const surprises = await prisma.surprise.findMany({
      where: {
        connectionId,
        OR: [
          // Kullanıcının kendi oluşturduğu ve henüz görmediği sürprizler
          {
            userId: user.id,
            isSeenByAuthor: false
          },
          // Eşinin oluşturduğu ve kullanıcının henüz görmediği sürprizler
          {
            userId: connection.userId === user.id && connection.pairedWithId 
              ? connection.pairedWithId 
              : connection.userId,
            isSeenByPartner: false
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(surprises);
    
  } catch (error) {
    console.error('Sürprizleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sürprizler yüklenirken bir hata oluştu' }, { status: 500 });
  }
}

// POST: Yeni sürpriz ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const connectionId = params.connectionId;
    const { imageUrl, message } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Sürpriz için bir resim gereklidir' }, { status: 400 });
    }
    
    // Bağlantıyı kontrol et
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        tree: true
      }
    });
    
    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcının bu bağlantıya erişim izni var mı kontrol et
    if (connection.userId !== user.id && connection.pairedWithId !== user.id) {
      return NextResponse.json({ error: 'Bu bağlantıya erişim izniniz yok' }, { status: 403 });
    }
    
    // Kullanıcının henüz görülmemiş bir sürprizi var mı kontrol et
    const existingSurprise = await prisma.surprise.findFirst({
      where: {
        connectionId,
        userId: user.id,
        OR: [
          { isSeenByAuthor: false },
          { isSeenByPartner: false }
        ]
      }
    });
    
    if (existingSurprise) {
      return NextResponse.json({ 
        error: 'Henüz görülmemiş bir sürpriziniz var. Yeni bir sürpriz eklemek için mevcut sürprizinizin görülmesini bekleyin.' 
      }, { status: 400 });
    }
    
    // Yeni sürpriz oluştur ve ağaca XP ekle, transaction içinde yapılır
    const transaction = await prisma.$transaction(async (tx) => {
      // Yeni sürpriz oluştur
      const surprise = await tx.surprise.create({
        data: {
          imageUrl,
          message,
          userId: user.id,
          connectionId,
          isSeenByAuthor: true, // Oluşturan kişi görmüş sayılır
          isSeenByPartner: false
        }
      });
      
      // Bağlantının ağacı var mı kontrol et
      if (connection.tree) {
        // Ağacı güncelle ve 10 XP ekle
        const updatedTree = await tx.tree.update({
          where: { id: connection.tree.id },
          data: {
            growthXP: { increment: 10 },
            lastWatered: new Date()
          }
        });
        
        // Ağacın XP'sine göre seviyesini güncelle
        const currentXP = updatedTree.growthXP;
        let newLevel = 1;
        
        // Her 1000 XP için bir seviye (Maksimum 3. seviye)
        if (currentXP >= 2000) {
          newLevel = 3;
        } else if (currentXP >= 1000) {
          newLevel = 2;
        }
        
        // Eğer seviye değiştiyse güncelle
        if (newLevel !== updatedTree.growthLevel) {
          await tx.tree.update({
            where: { id: connection.tree.id },
            data: { growthLevel: newLevel }
          });
        }
      }
      
      return surprise;
    });
    
    return NextResponse.json(transaction);
    
  } catch (error) {
    console.error('Sürpriz ekleme hatası:', error);
    return NextResponse.json({ error: 'Sürpriz eklenirken bir hata oluştu' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/auth/options';

// POST: Sürprizi görüldü olarak işaretle ve sil
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string, surpriseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    const { connectionId, surpriseId } = params;
    
    // Bağlantıyı kontrol et
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
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
    
    // Sürprizi bul
    const surprise = await prisma.surprise.findUnique({
      where: { id: surpriseId },
    });
    
    if (!surprise) {
      return NextResponse.json({ error: 'Sürpriz bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcının bu sürprizi görme yetkisi var mı kontrol et
    if (surprise.connectionId !== connectionId) {
      return NextResponse.json({ error: 'Bu sürprize erişim izniniz yok' }, { status: 403 });
    }
    
    // Görüntülenme durumuna göre sürprizi güncelleyelim
    let result;
    
    if (surprise.userId === user.id) {
      // Kullanıcı kendi sürprizini görüyorsa
      const updatedSurprise = await prisma.surprise.update({
        where: { id: surpriseId },
        data: { isSeenByAuthor: true },
      });
      result = updatedSurprise;
    } else {
      // Kullanıcı eşinin sürprizini görüyorsa
      const updatedSurprise = await prisma.surprise.update({
        where: { id: surpriseId },
        data: { isSeenByPartner: true },
      });
      result = updatedSurprise;
    }
    
    // Eğer her iki taraf da gördüyse sürprizi sil
    if (result.isSeenByAuthor && result.isSeenByPartner) {
      await prisma.surprise.delete({
        where: { id: surpriseId },
      });
      
      return NextResponse.json({ message: 'Sürpriz görüldü ve silindi' });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Sürpriz görüldü işaretleme hatası:', error);
    return NextResponse.json({ error: 'Sürpriz görüldü olarak işaretlenirken bir hata oluştu' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

// Not puanlama API'si - Bir nota 1-5 arası puan verme
export async function POST(
  request: NextRequest,
  { params }: { params: { connectionId: string; noteId: string } }
) {
  try {
    // Gelen parametreleri kontrol et
    console.log("API: Connection ID:", params.connectionId);
    console.log("API: Note ID:", params.noteId);
    
    if (!params.connectionId || !params.noteId) {
      return NextResponse.json({ error: 'Geçersiz bağlantı veya not ID\'si' }, { status: 400 });
    }
    
    const session = await getServerSession();
    
    // Oturum kontrolü
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Request body'den puanı al
    const body = await request.json();
    const { rating } = body;
    
    console.log("API: Rating değeri:", rating);
    
    // Puanın geçerli olup olmadığını kontrol et (1-5 arası)
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Geçerli bir puan girmelisiniz (1-5 arası)' 
      }, { status: 400 });
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    console.log("API: Kullanıcı ID:", user.id);
    
    // Aktif bağlantıyı kontrol et
    const connection = await prisma.connection.findFirst({
      where: {
        id: params.connectionId,
        OR: [
          { userId: user.id },
          { pairedWithId: user.id }
        ]
      }
    });
    
    if (!connection) {
      return NextResponse.json({ error: 'Bağlantı bulunamadı veya erişim izniniz yok' }, { status: 404 });
    }
    
    // Notu bul
    const note = await prisma.note.findFirst({
      where: {
        id: params.noteId,
        connectionId: params.connectionId
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
    
    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }
    
    console.log("API: Not yazarı ID:", note.authorId);
    
    // Kullanıcı kendi notunu puanlayamaz
    if (note.authorId === user.id) {
      console.log("API: Kendi notunu puanlama denemesi!");
      return NextResponse.json({ 
        error: 'Kendi notunuzu puanlayamazsınız' 
      }, { status: 403 });
    }
    
    // Notu güncelle
    const updatedNote = await prisma.note.update({
      where: { id: params.noteId },
      data: { rating },
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
    
    console.log("API: Not başarıyla puanlandı:", rating);
    
    return NextResponse.json(updatedNote);
    
  } catch (error) {
    console.error('Not puanlama hatası:', error);
    return NextResponse.json(
      { error: 'Not puanlanırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
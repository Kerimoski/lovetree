import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';

// Not detaylarını getirme API'si
export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string; noteId: string } }
) {
  try {
    // Gelen parametreleri kontrol et
    console.log("Get API: Connection ID:", params.connectionId);
    console.log("Get API: Note ID:", params.noteId);
    
    if (!params.connectionId || !params.noteId) {
      return NextResponse.json({ error: 'Geçersiz bağlantı veya not ID\'si' }, { status: 400 });
    }
    
    const session = await getServerSession();
    
    // Oturum kontrolü
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
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
    
    return NextResponse.json(note);
    
  } catch (error) {
    console.error('Not detayı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Not detayı alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}

// Not silme API'si
export async function DELETE(
  request: NextRequest,
  { params }: { params: { connectionId: string; noteId: string } }
) {
  try {
    // Gelen parametreleri kontrol et
    console.log("Delete API: Connection ID:", params.connectionId);
    console.log("Delete API: Note ID:", params.noteId);
    
    if (!params.connectionId || !params.noteId) {
      return NextResponse.json({ error: 'Geçersiz bağlantı veya not ID\'si' }, { status: 400 });
    }
    
    const session = await getServerSession();
    
    // Oturum kontrolü
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
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
      }
    });
    
    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }
    
    // Sadece not sahibi veya bağlantı sahibi silebilir
    if (note.authorId !== user.id && connection.userId !== user.id) {
      return NextResponse.json({ error: 'Bu notu silme yetkiniz yok' }, { status: 403 });
    }
    
    // Notu sil
    await prisma.note.delete({
      where: { id: params.noteId }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Not silme hatası:', error);
    return NextResponse.json(
      { error: 'Not silinirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
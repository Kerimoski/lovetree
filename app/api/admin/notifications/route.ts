import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { NotificationType } from '@/app/generated/prisma';

// Admin kontrolü fonksiyonu
async function isAdmin(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return false;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  return user?.role === 'ADMIN';
}

// Bildirim gönderme
export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }
    
    const body = await request.json();
    const { title, message, data, url, type, recipients, segments } = body;
    
    // Zorunlu alanları kontrol et
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Başlık ve mesaj zorunludur' }, 
        { status: 400 }
      );
    }
    
    // Bildirim veritabanına kaydetme
    let createdNotifications;
    const notificationType = body.notificationType || 'SYSTEM' as NotificationType;
    
    if (type === 'all') {
      // Tüm kullanıcılara bildirim kaydı
      const users = await prisma.user.findMany({
        select: { id: true }
      });
      
      const notifications = users.map(user => ({
        title,
        body: message,
        type: notificationType,
        userId: user.id,
        data: data ? data : undefined,
        sentAt: new Date()
      }));
      
      createdNotifications = await prisma.notification.createMany({
        data: notifications
      });
    } else if (type === 'users' && recipients && Array.isArray(recipients)) {
      // Belirli kullanıcılara bildirim kaydı
      const users = await prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { id: true }
      });
      
      const notifications = users.map(user => ({
        title,
        body: message,
        type: notificationType,
        userId: user.id,
        data: data ? data : undefined,
        sentAt: new Date()
      }));
      
      createdNotifications = await prisma.notification.createMany({
        data: notifications
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bildirimler başarıyla oluşturuldu',
      dbNotifications: createdNotifications
    });
  } catch (error) {
    console.error('Bildirim gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Bildirim gönderilirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
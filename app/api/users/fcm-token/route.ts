import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }
    
    // Request body'den fcmToken'ı al
    const { fcmToken } = await request.json();
    
    if (!fcmToken) {
      return NextResponse.json({ error: 'FCM token gerekli' }, { status: 400 });
    }
    
    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { fcmToken }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'FCM token başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('FCM token güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'FCM token güncellenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}
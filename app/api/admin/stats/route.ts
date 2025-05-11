import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

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

export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }
    
    // Son 30 gün için tarih
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Toplam kullanıcı sayısı
    const totalUsers = await prisma.user.count();
    
    // Toplam bağlantı sayısı
    const totalConnections = await prisma.connection.count();
    
    // Son 30 günde aktif kullanıcılar (güncellenen kullanıcılar)
    const activeUsers30Days = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Diğer kullanışlı istatistikleri burada hesaplayabilirsiniz
    // Örneğin: Toplam anı sayısı, özel gün sayısı, not sayısı, vb.
    
    return NextResponse.json({
      totalUsers,
      totalConnections,
      activeUsers30Days,
      // Diğer istatistikler buraya eklenebilir
    });
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
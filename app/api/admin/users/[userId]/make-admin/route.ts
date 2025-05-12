import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/auth/options';

// Admin kontrolü fonksiyonu
async function isAdmin(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Admin kontrolü sırasında hata:', error);
    return false;
  }
}

// Next.js App Router API route - POST handler
export async function POST(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params;
    
    // Admin kontrolü
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }
    
    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    // Kullanıcı zaten admin mi?
    if (user.role === 'ADMIN') {
      return NextResponse.json({ 
        message: 'Kullanıcı zaten admin rolünde' 
      });
    }
    
    // Kullanıcıyı admin yap
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Kullanıcı başarıyla admin yapıldı'
    });
  } catch (error) {
    console.error('Kullanıcıyı admin yapma hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı admin yapılırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
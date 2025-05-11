import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });
    
    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 404 });
    }
    
    // Admin kontrolü
    const isAdmin = user.role === 'ADMIN';
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin kontrolü hatası:', error);
    return NextResponse.json(
      { error: 'Admin kontrolü sırasında bir hata oluştu', isAdmin: false }, 
      { status: 500 }
    );
  }
} 
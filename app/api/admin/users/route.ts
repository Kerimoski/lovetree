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
    
    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        connections: {
          select: { id: true }
        }
      }
    });
    
    // Kullanıcıları formatla
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      connectionCount: user.connections.length
    }));
    
    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 
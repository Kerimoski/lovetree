import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Kullanıcı oluştur
export async function POST(req: Request) {
  try {
    const { email, name, image } = await req.json();

    // Email kontrolü
    if (!email) {
      return NextResponse.json({ error: 'Email gereklidir' }, { status: 400 });
    }

    // Kullanıcı var mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu email adresi zaten kullanılıyor' }, { status: 400 });
    }

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        image
      }
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 500 });
  }
}

// Tüm kullanıcıları getir (sadece admin için)
export async function GET(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // Burada admin kontrolü yapılabilir
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    // }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        connections: {
          select: {
            id: true,
            connectionCode: true,
            pairedWith: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(users);
    
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
} 
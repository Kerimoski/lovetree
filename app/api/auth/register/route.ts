import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    console.log('Kayıt isteği alındı');
    
    const body = await req.json();
    console.log('İstek gövdesi:', body);
    
    const { email, name, password } = body;

    // Gerekli alan kontrolü
    if (!email || !name || !password) {
      console.log('Eksik alanlar:', { email, name, password: !!password });
      return NextResponse.json(
        { error: 'Email, isim ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Geçersiz email formatı:', email);
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      console.log('Şifre çok kısa:', password.length);
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Kullanıcı var mı kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Kullanıcı zaten var:', email);
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 10);
    console.log('Şifre hashlendi');

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });
    console.log('Yeni kullanıcı oluşturuldu:', newUser.id);

    // Şifreyi yanıtta gösterme
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error('Kullanıcı kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    );
  }
} 
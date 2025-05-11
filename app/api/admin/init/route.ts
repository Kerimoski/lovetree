import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

// Sadece sunucu başlatılırken çalıştırılacak API
// Env dosyasındaki admin hesap bilgilerini kontrol eder/oluşturur
export async function GET(request: NextRequest) {
  // Güvenlik: Sadece sunucu tarafından erişilebilir olmalı
  const authHeader = request.headers.get('authorization');
  const isServerRequest = authHeader === `Bearer ${process.env.NEXTAUTH_SECRET}`;
  
  // Geliştirme modunda her zaman erişime izin ver
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && !isServerRequest) {
    return NextResponse.json({ 
      error: 'Bu endpoint sadece sunucu tarafından erişilebilir.' 
    }, { status: 403 });
  }
  
  try {
    // Env dosyasından admin bilgilerini al
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    
    // Admin bilgileri tanımlanmamışsa hata ver
    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ 
        error: 'Admin hesap bilgileri (.env dosyasında) tanımlanmamış.',
        tip: 'ADMIN_EMAIL ve ADMIN_PASSWORD çevre değişkenlerini tanımlayın.' 
      }, { status: 500 });
    }
    
    // Bu e-postaya sahip bir kullanıcı var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      // Kullanıcı varsa, admin rolüne sahip olduğundan emin ol
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Mevcut kullanıcı admin rolüne yükseltildi.'
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Admin hesabı zaten mevcut.'
      });
    } else {
      // Yeni admin hesabı oluştur
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: await bcrypt.hash(adminPassword, 10),
          role: 'ADMIN'
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Yeni admin hesabı başarıyla oluşturuldu.'
      });
    }
  } catch (error: any) {
    console.error('Admin hesabı başlatma hatası:', error);
    
    return NextResponse.json({ 
      error: 'Admin hesabı oluşturulurken bir hata oluştu.',
      details: error.message
    }, { status: 500 });
  }
} 
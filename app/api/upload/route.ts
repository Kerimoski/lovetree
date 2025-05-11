import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Formdata olarak gönderilen dosyayı al
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya tipi. Sadece JPEG, PNG, GIF ve WEBP dosyaları kabul edilir.' },
        { status: 400 }
      );
    }

    // Dosya büyüklüğü kontrolü (1MB'tan küçük olmalı)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 1MB olabilir.' },
        { status: 400 }
      );
    }

    // Buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Benzersiz dosya adı oluştur (uuid + orijinal dosya uzantısı)
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Dosyayı kaydet
    const uploadDir = join(process.cwd(), 'public/uploads/images');
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Dosya URL'ini döndür
    const fileUrl = `/uploads/images/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      fileUrl 
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenemedi' },
      { status: 500 }
    );
  }
} 
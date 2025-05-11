// Admin hesabının başlatılması için sunucu tarafında çalışacak kod
import { headers } from 'next/headers';

// En çok 1 saat aralıklarla tekrar kontrol et (saniye cinsinden)
const CHECK_INTERVAL = 60 * 60;
let lastChecked = 0;

// Admin hesabını kontrol et veya oluştur
export async function initAdminAccount() {
  // Sadece sunucu tarafında çalıştır
  if (typeof window !== 'undefined') return;
  
  // Sık kontrol yapılmasını önle
  const now = Math.floor(Date.now() / 1000);
  if (now - lastChecked < CHECK_INTERVAL) return;
  lastChecked = now;
  
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/init`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Admin hesabı kontrolü:', data.message);
    } else {
      const error = await response.json();
      console.error('Admin hesabı başlatma hatası:', error);
    }
  } catch (error) {
    console.error('Admin hesabı başlatma işlemi başarısız:', error);
  }
}

// Sunucu tarafında otomatik başlatma
// Bu dosya import edildiğinde çalışır
if (typeof window === 'undefined') {
  // Sadece production ve development ortamlarında çalıştır
  if (['production', 'development'].includes(process.env.NODE_ENV || '')) {
    // Zamanlayıcı ile gecikmeli başlat (sunucunun tamamen başlaması için)
    setTimeout(() => {
      initAdminAccount().catch(error => {
        console.error('Admin hesabı başlatma hatası:', error);
      });
    }, 5000);
  }
} 
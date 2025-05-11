import NextAuth from 'next-auth';
import { authOptions } from '@/app/auth/options';

// Ağaç sulanması için yardımcı fonksiyon
async function waterTreeOnLogin(userId: string) {
  try {
    // API URL için tam url oluştur
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Kullanıcının aktif bağlantısını bul
    const res = await fetch(`${baseUrl}/api/users/${userId}/active-connection`);
    
    if (!res.ok) {
      console.error('Aktif bağlantı getirilemedi:', res.status);
      return;
    }
    
    const { connection } = await res.json();
    
    if (!connection) {
      console.log('Kullanıcının aktif bağlantısı bulunamadı');
      return;
    }
    
    console.log('Aktif bağlantı bulundu:', connection.id);
    
    // Ağacı sula (giriş işlemi için)
    const waterRes = await fetch(`${baseUrl}/api/connections/${connection.id}/tree/water`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        actionType: 'LOGIN' // Giriş yapma işlemi
      })
    });
    
    if (!waterRes.ok) {
      console.error('Ağaç sulama hatası:', waterRes.status);
      return;
    }
    
    const result = await waterRes.json();
    console.log(`Kullanıcı girişi ile ağaç sulandı: ${userId}`, result);
  } catch (error) {
    console.error('Giriş sırasında ağaç sulama hatası:', error);
  }
}

// Oturum açma olayını dinleyen bir handler
const handler = NextAuth({
  ...authOptions,
  events: {
    signIn: async ({ user }) => {
      if (user && user.id) {
        // Kullanıcı giriş yaptığında ağacı sula
        await waterTreeOnLogin(user.id);
      }
    }
  }
});

export { handler as GET, handler as POST }; 
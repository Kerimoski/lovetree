/**
 * Rastgele bir bağlantı kodu oluşturur
 * @returns 6 karakterli alfanümerik kod
 */
export function generateRandomCode(): string {
  // Basit karakterler kullanarak daha güvenilir bir kod oluşturalım
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // 6 karakterli rastgele kod oluştur
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  
  return result;
} 
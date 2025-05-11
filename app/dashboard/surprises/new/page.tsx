'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import ImageUploader from '@/app/components/ImageUploader';
import { FaSave, FaArrowLeft, FaGift } from 'react-icons/fa';

export default function NewSurprisePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeConnection } = useUserContext();
  
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingSurprise, setHasExistingSurprise] = useState(false);

  // Mevcut görülmemiş sürprizleri kontrol et
  const checkExistingSurprises = async () => {
    if (!activeConnection) return;
    
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/surprises`);
      
      if (!response.ok) {
        throw new Error('Sürprizler kontrol edilemedi');
      }
      
      const data = await response.json();
      
      // Kullanıcının oluşturduğu ve henüz görülmemiş bir sürpriz varsa
      if (data.some((surprise: any) => surprise.userId === session?.user?.id)) {
        setHasExistingSurprise(true);
      }
      
    } catch (err) {
      console.error('Sürprizleri kontrol etme hatası:', err);
    }
  };
  
  // Sayfa yüklendiğinde mevcut sürprizleri kontrol et
  useEffect(() => {
    if (activeConnection && session?.user?.id) {
      checkExistingSurprises();
    }
  }, [activeConnection, session?.user?.id]);

  // Yeni sürpriz oluştur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection) {
      setError('Aktif bağlantı bulunamadı');
      return;
    }
    
    if (!imageUrl) {
      setError('Sürpriz için bir fotoğraf seçmelisiniz');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // API isteği
      const response = await fetch(`/api/connections/${activeConnection.id}/surprises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          imageUrl,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sürpriz oluşturulamadı');
      }
      
      // Başarılı ise sürprizler sayfasına yönlendir
      router.push('/dashboard/surprises');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sürpriz oluşturulurken bir hata oluştu');
      console.error('Sürpriz oluşturma hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Oturum yükleniyor veya aktif bağlantı yoksa
  if (status === 'loading' || !activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link 
              href="/dashboard/surprises" 
              className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <FaArrowLeft className="mr-2" /> Sürprizlere Dön
            </Link>
            <h1 className="text-3xl font-bold text-emerald-700">Yeni Sürpriz Ekle</h1>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {hasExistingSurprise ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg mb-6">
            Henüz görülmemiş bir sürpriziniz var. Eşinizin mevcut sürprizi görmesini bekleyin.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                <FaGift className="inline-block mr-2 text-emerald-500" />
                <strong className="text-emerald-600 dark:text-emerald-400">Önemli Bilgi:</strong> Bu sürpriz, siz ve eşiniz tarafından sadece bir kez görüntülenebilir. Bir kez görüldükten sonra kaybolacaktır.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Sürpriz Fotoğrafı <span className="text-red-500">*</span>
                  </label>
                  <ImageUploader 
                    onImageUploaded={setImageUrl} 
                    defaultImage={imageUrl || undefined}
                    useFirebase={false}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mesaj (İsteğe Bağlı)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Fotoğrafla birlikte gösterilecek bir mesaj yazın..."
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <Link
                    href="/dashboard/surprises"
                    className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    İptal
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || !imageUrl}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Sürprizi Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 
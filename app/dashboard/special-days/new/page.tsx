'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function NewSpecialDayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bugünün tarihi (minimum tarih olarak kullanılacak)
  const today = new Date().toISOString().split('T')[0];

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Özel gün oluşturma işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection) return;
    
    // Boş alan kontrolü
    if (!title.trim()) {
      setError('Lütfen özel gün başlığı girin');
      return;
    }
    
    if (!date) {
      setError('Lütfen tarih seçin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        title,
        description: description.trim() || null,
        date,
        isRecurring
      };
      
      console.log('Özel gün oluşturma isteği:', {
        url: `/api/connections/${activeConnection.id}/special-days`,
        data: payload
      });
      
      const response = await fetch(`/api/connections/${activeConnection.id}/special-days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sunucu hata yanıtı:', errorData);
        throw new Error(errorData.error || 'Özel gün oluşturulamadı');
      }
      
      const data = await response.json();
      console.log('Özel gün başarıyla oluşturuldu:', data);
      
      // Başarılı ise özel günler sayfasına yönlendir
      router.push('/dashboard/special-days');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Özel gün oluşturulurken bir hata oluştu');
      console.error('Özel gün oluşturma hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yükleniyor durumu
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Aktif bağlantı yoksa
  if (!activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aktif Bağlantı Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bu bölümü kullanabilmek için önce bir bağlantı kurmanız gerekiyor.
          </p>
          <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard/special-days" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Özel Günlere Dön
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Yeni Özel Gün Oluştur</h1>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Özel Gün Başlığı*
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Doğum Günüm, Yıldönümüz"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Özel gün hakkında detaylar..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tarih*
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Her yıl tekrarla (yıllık etkinlik)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Özel Gün Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
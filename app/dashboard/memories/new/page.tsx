'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import ImageUploader from '@/app/components/ImageUploader';
import { FaSave, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

export default function NewMemoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeConnection } = useUserContext();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Bugünün tarihi
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Varsayılan olarak yerel depolama kullanılacak (false)
  const [useFirebaseStorage, setUseFirebaseStorage] = useState(false);

  // Yeni anı oluştur
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection) {
      setError('Aktif bağlantı bulunamadı');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // API isteği
      const response = await fetch(`/api/connections/${activeConnection.id}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          date,
          imageUrl,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Anı oluşturulamadı');
      }
      
      // Başarılı ise anılar sayfasına yönlendir
      router.push('/dashboard/memories');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anı oluşturulurken bir hata oluştu');
      console.error('Anı oluşturma hatası:', err);
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
              href="/dashboard/memories" 
              className="flex items-center text-emerald-600 hover:text-emerald-700 mb-2"
            >
              <FaArrowLeft className="mr-2" /> Anılara Dön
            </Link>
            <h1 className="text-3xl font-bold text-emerald-700">Yeni Anı Ekle</h1>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Anınıza bir başlık verin"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tarih
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Bu anı ile ilgili detayları yazın..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fotoğraf (İsteğe Bağlı)
                </label>
                {/* Onay kutusunu kaldırıldı - Fotoğraflar her zaman yerel olarak depolanacak */}
                <ImageUploader 
                  onImageUploaded={setImageUrl} 
                  defaultImage={imageUrl || undefined}
                  useFirebase={false} // Her zaman yerel depolama kullan
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fotoğraflar sunucuda yerel olarak depolanacaktır
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Link
                  href="/dashboard/memories"
                  className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
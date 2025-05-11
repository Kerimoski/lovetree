'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  date: string;
  createdAt: string;
}

export default function MemoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Anıları getir
  useEffect(() => {
    const fetchMemories = async () => {
      if (!activeConnection) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/memories`);
        
        if (!response.ok) {
          throw new Error('Anılar getirilemedi');
        }
        
        const data = await response.json();
        setMemories(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Anılar yüklenirken bir hata oluştu');
        console.error('Anıları getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemories();
  }, [activeConnection]);

  // Ana içerik yükleniyor
  if (status === 'loading' || loading || !activeConnection) {
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

  // Anılar sayfası
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Dashboard'a Dön
          </Link>
        </div>
      
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Anılarınız</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Birlikte geçirdiğiniz özel anları kaydedin ve hatırlayın
            </p>
          </div>
          <Link 
            href="/dashboard/memories/new" 
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" /> Anı Ekle
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <FaCalendarAlt className="text-5xl text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Henüz Anı Eklenmemiş</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Birlikte geçirdiğiniz özel günleri ve anıları kaydetmeye başlayın. 
                Fotoğraflar ve notlarla bu anıları ölümsüzleştirin.
              </p>
              <Link 
                href="/dashboard/memories/new" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaPlus className="mr-2" /> İlk Anınızı Ekleyin
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <Link 
                href={`/dashboard/memories/${memory.id}`} 
                key={memory.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-48">
                  {memory.imageUrl ? (
                    <Image 
                      src={memory.imageUrl} 
                      alt={memory.title} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                      <FaCalendarAlt className="text-5xl text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white text-sm flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(memory.date).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white line-clamp-1">
                    {memory.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {memory.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
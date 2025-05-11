'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaArrowLeft, FaUser } from 'react-icons/fa';

interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  date: string;
  createdAt: string;
  userId: string;
}

export default function MemoryDetailPage({ params }: { params: { memoryId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memoryId, setMemoryId] = useState<string | null>(null);

  // Params'tan memory ID'yi al
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setMemoryId(resolvedParams.memoryId);
    };
    
    resolveParams();
  }, [params]);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Anı detayını getir
  useEffect(() => {
    const fetchMemoryDetail = async () => {
      if (!activeConnection || !memoryId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/memories/${memoryId}`);
        
        if (!response.ok) {
          throw new Error('Anı detayı getirilemedi');
        }
        
        const data = await response.json();
        setMemory(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Anı detayı yüklenirken bir hata oluştu');
        console.error('Anı detayı getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemoryDetail();
  }, [activeConnection, memoryId]);

  // Yükleniyor durumu
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

  // Anı detay sayfası içeriği
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard/memories" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Anılara Dön
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : !memory ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Anı Bulunamadı</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Aradığınız anı bulunamadı veya bu anıya erişim izniniz yok.
              </p>
              <Link 
                href="/dashboard/memories" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Anılara Dön
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {memory.imageUrl && (
              <div className="relative w-full h-80">
                <Image 
                  src={memory.imageUrl} 
                  alt={memory.title} 
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-2" />
                  <span>{new Date(memory.date).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>Eklendi: {new Date(memory.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                {memory.title}
              </h1>
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {memory.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaLock, FaLockOpen, FaArrowLeft, FaClock, FaCalendarAlt, FaComment } from 'react-icons/fa';
import { formatDistanceToNow, format, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TimeCapsule {
  id: string;
  title: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  openDate: string;
  isOpened: boolean;
  openedAt: string | null;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
  };
}

export default function TimeCapsulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Zaman kapsüllerini getir
  useEffect(() => {
    const fetchTimeCapsules = async () => {
      if (!activeConnection) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules`);
        
        if (!response.ok) {
          throw new Error('Zaman kapsülleri getirilemedi');
        }
        
        const data = await response.json();
        setTimeCapsules(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Zaman kapsülleri yüklenirken bir hata oluştu');
        console.error('Zaman kapsüllerini getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeCapsules();
  }, [activeConnection]);

  // Kapsül açma onay fonksiyonu
  const handleOpenCapsule = async (capsuleId: string) => {
    if (!activeConnection) return;
    
    if (!confirm("Kapsülü açmak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules/${capsuleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kapsül açılamadı');
      }
      
      // Kapsülleri yenile
      const updatedCapsules = timeCapsules.map(capsule => 
        capsule.id === capsuleId 
          ? { ...capsule, isOpened: true, openedAt: new Date().toISOString() }
          : capsule
      );
      
      setTimeCapsules(updatedCapsules);
      alert("Kapsül başarıyla açıldı!");
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kapsül açılırken bir hata oluştu');
      console.error('Kapsül açma hatası:', err);
    }
  };

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

  // Zaman Kapsülleri sayfası
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Zaman Kapsülleri</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Anılarınızı saklamak ve gelecekte açmak için kapsüller oluşturun
            </p>
          </div>
          <Link 
            href="/dashboard/time-capsules/new" 
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" /> Kapsül Oluştur
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
        ) : timeCapsules.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <FaLock className="text-5xl text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Henüz Kapsül Eklenmemiş</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Gelecekte açmak üzere anılarınızı, mesajlarınızı ve fotoğraflarınızı 
                saklamak için ilk zaman kapsülünüzü oluşturun.
              </p>
              <Link 
                href="/dashboard/time-capsules/new" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaPlus className="mr-2" /> İlk Kapsülünüzü Oluşturun
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {timeCapsules.map((capsule) => {
              const openDate = new Date(capsule.openDate);
              const now = new Date();
              const isOpenable = isAfter(now, openDate) && !capsule.isOpened;
              
              return (
                <div 
                  key={capsule.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {capsule.user.image ? (
                          <Image 
                            src={capsule.user.image} 
                            alt={capsule.user.name || ''} 
                            width={40} 
                            height={40} 
                            className="rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-emerald-600 font-semibold">
                              {capsule.user.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{capsule.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(capsule.createdAt), 'd MMMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {capsule.isOpened ? (
                          <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                            <FaLockOpen className="mr-1" /> Açık
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                            <FaLock className="mr-1" /> Kilitli
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                      {capsule.isOpened 
                        ? capsule.title
                        : <span className="flex items-center"><FaLock className="mr-2" /> Kilitli Kapsül</span>
                      }
                    </h3>

                    {/* Açılmış kapsüllerin içeriği gösterilir */}
                    {capsule.isOpened ? (
                      <>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {capsule.description}
                        </p>
                        
                        {capsule.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden relative" style={{ height: '200px' }}>
                            <Image 
                              src={capsule.imageUrl} 
                              alt={capsule.title} 
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-6 flex justify-center items-center">
                        <FaLock className="text-3xl text-gray-300 dark:text-gray-600" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FaCalendarAlt className="mr-1" />{' '}
                        {capsule.isOpened 
                          ? `${format(new Date(capsule.openDate), 'd MMMM yyyy', { locale: tr })} tarihinde açıldı`
                          : `${format(new Date(capsule.openDate), 'd MMMM yyyy', { locale: tr })} tarihinde açılacak`
                        }
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Link 
                          href={`/dashboard/time-capsules/${capsule.id}`}
                          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <FaComment className="mr-1" /> {capsule._count.comments}
                        </Link>
                        
                        {isOpenable && (
                          <button 
                            onClick={() => handleOpenCapsule(capsule.id)}
                            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                          >
                            <FaLockOpen className="mr-1" /> Kapsülü Aç
                          </button>
                        )}

                        {!capsule.isOpened && !isOpenable && (
                          <div className="inline-flex items-center text-sm text-gray-500">
                            <FaClock className="mr-1" /> {formatDistanceToNow(new Date(capsule.openDate), { locale: tr, addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
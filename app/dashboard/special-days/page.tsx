'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { FaPlus, FaCalendarAlt, FaCheck, FaClock, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';

// Özel gün tipi tanımı
type SpecialDay = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  isRecurring: boolean;
  isConfirmed: boolean;
  confirmedAt: string | null;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  daysLeft: number;
  isPast: boolean;
  isToday: boolean;
};

export default function SpecialDaysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Özel günleri getir
  useEffect(() => {
    if (activeConnection && session) {
      fetchSpecialDays();
    }
  }, [activeConnection, session]);

  // Özel günleri getir
  const fetchSpecialDays = async () => {
    if (!activeConnection) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/special-days`);
      
      if (!response.ok) {
        throw new Error('Özel günler getirilemedi');
      }
      
      const data = await response.json();
      setSpecialDays(data);
      
    } catch (err) {
      console.error('Özel günleri getirme hatası:', err);
      setError('Özel günler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Özel günü onayla
  const confirmSpecialDay = async (specialDayId: string) => {
    if (!activeConnection) return;
    
    try {
      setError(null);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/special-days/${specialDayId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Özel gün onaylanamadı');
      }
      
      const updatedSpecialDay = await response.json();
      
      // Listeyi güncelle
      setSpecialDays(prevDays => 
        prevDays.map(day => 
          day.id === specialDayId ? updatedSpecialDay : day
        )
      );
      
    } catch (err) {
      console.error('Özel gün onaylama hatası:', err);
      setError(err instanceof Error ? err.message : 'Özel gün onaylanırken bir hata oluştu');
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Dashboard'a Dön
          </Link>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Özel Günler
          </h1>
          <Link 
            href="/dashboard/special-days/new" 
            className="inline-flex items-center bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Yeni Özel Gün
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : specialDays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <FaCalendarAlt className="mx-auto text-5xl text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Henüz Özel Gün Yok</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Doğum günleri, yıldönümleri ve diğer önemli günleri ekleyerek ilişkinizi özel kılın!
              </p>
              <Link 
                href="/dashboard/special-days/new" 
                className="inline-flex items-center bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
              >
                <FaPlus className="mr-2" /> İlk Özel Günü Ekle
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialDays.map(specialDay => (
              <div 
                key={specialDay.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden
                  ${!specialDay.isConfirmed ? 'opacity-70' : ''}
                  ${specialDay.isToday ? 'ring-2 ring-emerald-500' : ''}
                  ${specialDay.isPast ? 'border-l-4 border-gray-300' : ''}
                `}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                        {specialDay.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(specialDay.date)}
                        {specialDay.isRecurring && ' (Yıllık)'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {specialDay.user?.image && (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <Image 
                            src={specialDay.user.image} 
                            alt={specialDay.user.name || 'Kullanıcı'} 
                            width={40} 
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {specialDay.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {specialDay.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      <FaClock className={`mr-2 ${specialDay.isPast ? 'text-gray-400' : specialDay.isToday ? 'text-emerald-500' : 'text-blue-500'}`} />
                      <span className={`text-sm ${specialDay.isPast ? 'text-gray-400' : specialDay.isToday ? 'text-emerald-600 font-bold' : 'text-blue-600'}`}>
                        {specialDay.isPast 
                          ? 'Geçti' 
                          : specialDay.isToday 
                          ? 'Bugün!' 
                          : `${specialDay.daysLeft} gün kaldı`}
                      </span>
                    </div>
                    
                    {!specialDay.isConfirmed && specialDay.userId !== session?.user?.id && (
                      <button
                        onClick={() => confirmSpecialDay(specialDay.id)}
                        className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <FaCheck className="mr-2" /> Katıl
                      </button>
                    )}
                    
                    {specialDay.isConfirmed && (
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm flex items-center">
                        <FaCheck className="mr-2" /> Onaylandı
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
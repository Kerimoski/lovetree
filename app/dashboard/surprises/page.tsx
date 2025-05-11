'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaGift, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

interface Surprise {
  id: string;
  imageUrl: string;
  message: string | null;
  createdAt: string;
  userId: string;
  isSeenByAuthor: boolean;
  isSeenByPartner: boolean;
}

export default function SurprisesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedSurprises, setViewedSurprises] = useState<Set<string>>(new Set());

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Sürprizleri getir
  useEffect(() => {
    const fetchSurprises = async () => {
      if (!activeConnection) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/surprises`);
        
        if (!response.ok) {
          throw new Error('Sürprizler getirilemedi');
        }
        
        const data = await response.json();
        setSurprises(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sürprizler yüklenirken bir hata oluştu');
        console.error('Sürprizleri getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSurprises();
  }, [activeConnection]);

  // Sürprizleri otomatik olarak görüldü olarak işaretle
  useEffect(() => {
    const markSurprisesAsSeen = async () => {
      if (!activeConnection || !surprises.length) return;
      
      // Görüntülediklerimizi takip etmek için bir set kullanıyoruz
      const newViewedSurprises = new Set(viewedSurprises);
      let hasNewViews = false;
      
      // Her sürpriz için API'ye istek yapacak promise'leri hazırla
      const promises = surprises.map(async (surprise) => {
        // Eğer bu sürprizi daha önce görüntülemediysek
        if (!viewedSurprises.has(surprise.id)) {
          newViewedSurprises.add(surprise.id);
          hasNewViews = true;
          
          // API isteği gönder
          try {
            await fetch(`/api/connections/${activeConnection.id}/surprises/${surprise.id}/seen`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (err) {
            console.error(`Sürpriz ${surprise.id} görüldü işaretleme hatası:`, err);
          }
        }
      });
      
      // Tüm API isteklerinin tamamlanmasını bekle
      await Promise.all(promises);
      
      // Eğer yeni görüntülenen sürpriz varsa, görüntülenen listesini güncelle
      if (hasNewViews) {
        setViewedSurprises(newViewedSurprises);
      }
    };
    
    // Sayfa görüntülendiğinde sürprizleri görüldü olarak işaretle
    markSurprisesAsSeen();
    
    // Sayfa kapatıldığında beforeunload event'i
    const handleBeforeUnload = () => {
      // Sayfa kapatılmadan önce işaretleme işlemini gerçekleştiriyoruz
      // localStorage'ı kullanabilirdik ancak async olarak API çağrısı yapmak 
      // beforeunload event'inde zor olabilir
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Sayfa unmount olduğunda, henüz işaretlenmemiş sürprizleri işaretle
      markSurprisesAsSeen();
    };
  }, [activeConnection, surprises, viewedSurprises]);

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

  // Sürprizler sayfası
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
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Sürpriz Duvarı</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sevdiğiniz kişiye özel, tek seferlik görüntülenen sürprizler gönderin
            </p>
          </div>
          <Link 
            href="/dashboard/surprises/new" 
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" /> Sürpriz Ekle
          </Link>
        </header>

        <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-6 py-4 rounded-lg mb-6 flex items-start">
          <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
          <div>
            <p>Görüntülediğiniz sürprizler otomatik olarak "görüldü" olarak işaretlenir ve sayfadan ayrıldıktan sonra bir daha görüntülenmezler. Klasik "bir kez görüntüle" özelliği gibi çalışır.</p>
            <p className="mt-2"><strong>Yeni:</strong> Her sürpriz, kullanıcı ve eşi tarafından görüntülendikten sonra tamamen silinir. Ayrıca, her yeni sürpriz ağacınıza 10 XP kazandırır!</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : surprises.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <FaGift className="text-5xl text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Henüz Hiç Sürpriz Yok</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sevdiğiniz kişiye bir sürpriz gönderin! Bu sürprizler sadece bir kez görüntülenebilir ve 
                sonra kaybolur. Eşiniz de sadece bir kez görüntüleyebilir.
              </p>
              <Link 
                href="/dashboard/surprises/new" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaPlus className="mr-2" /> İlk Sürprizinizi Gönderin
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {surprises.map((surprise) => (
              <div 
                key={surprise.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    {surprise.userId === session?.user?.id ? 'Sizin Gönderdiğiniz Sürpriz' : 'Size Gönderilen Sürpriz'}
                  </h3>
                  
                  <div className="relative w-full rounded-lg overflow-hidden mb-4" style={{ maxHeight: '400px' }}>
                    <Image 
                      src={surprise.imageUrl} 
                      alt="Sürpriz" 
                      width={800}
                      height={600}
                      className="object-contain w-full h-auto"
                    />
                  </div>
                  
                  {surprise.message && (
                    <div className="border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 dark:text-gray-300">{surprise.message}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-sm text-emerald-600 dark:text-emerald-300 flex items-center">
                    <FaInfoCircle className="mr-2" /> 
                    Bu sürpriz sayfadan ayrıldığınızda otomatik olarak görüldü olarak işaretlenecek ve bir daha görüntülenmeyecektir.
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
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useEffect } from 'react';

/**
 * Mesajlaşma sayfası
 * NOT: Bu sayfa şu anda devre dışı bırakılmıştır.
 * Mesajlaşma sistemi bakım modundadır ve gelecekte yeni bir 
 * sürüm ile tekrar etkinleştirilecektir.
 */
export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Yükleme durumu
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
        {/* Başlık */}
        <header className="flex-none bg-white dark:bg-gray-800 shadow-md p-4 flex items-center">
          <Link href="/dashboard" className="mr-3 text-emerald-600">
            <FaArrowLeft />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Eş ile Mesajlaşma</h1>
          </div>
        </header>

        {/* Bakım mesajı */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Mesajlaşma Sistemi Geçici Olarak Devre Dışı
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Mesajlaşma sistemi şu anda güncellenmektedir. Daha iyi bir mesajlaşma deneyimi sunmak için çalışıyoruz.
              En kısa sürede yeni bir mesajlaşma sistemiyle geri döneceğiz.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Anlayışınız için teşekkür ederiz.
            </p>
            <div className="mt-8">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              >
                Dashboard'a Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
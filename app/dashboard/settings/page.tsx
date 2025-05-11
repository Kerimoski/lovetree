'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaSignOutAlt } from 'react-icons/fa';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading, setActiveConnection } = useUserContext();
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Çıkış yapma işlemi
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      
      // NextAuth.js'nin signOut fonksiyonunu çağır
      await signOut({ redirect: false });
      
      // Login sayfasına yönlendir
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çıkış yapılırken bir hata oluştu');
      console.error('Çıkış yapma hatası:', err);
      setIsLoggingOut(false);
    }
  };

  // Bağlantıyı tamamen silme işlemi (tüm verilerle birlikte)
  const handleFullDisconnect = async () => {
    if (!activeConnection) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/disconnect`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bağlantı kesme işlemi başarısız oldu');
      }
      
      setSuccess('Bağlantı ve tüm veriler tamamen silindi.');
      setActiveConnection(null);
      
      // Kısa bir süre sonra ana sayfaya yönlendir
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bağlantı kesilirken bir hata oluştu');
      console.error('Bağlantı kesme hatası:', err);
    } finally {
      setIsProcessing(false);
      setShowDisconnectConfirm(false);
    }
  };

  // Yükleniyor durumu
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Aktif bağlantı yoksa
  if (!activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aktif Bağlantı Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bu bölümü kullanabilmek için önce bir bağlantı kurmanız gerekiyor.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Dashboard'a Dön
          </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" />
              {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ayarlar sayfası içeriği
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/30 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Dashboard'a Dön
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-6">Ayarlar</h1>
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Çıkış Yap */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Hesap</h2>
              
              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                <div className="flex items-start">
                  <FaSignOutAlt className="text-emerald-500 text-xl mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Çıkış Yap</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                      Hesabınızdan güvenli bir şekilde çıkış yapın. Tekrar giriş yapmak için kullanıcı bilgilerinizi girmeniz gerekecektir.
                    </p>
                    
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      {isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tehlikeli İşlemler</h2>
              
              {/* Bağlantıyı Tamamen Sil */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaTrash className="text-red-500 text-xl mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Bağlantıyı Sil</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                      Bu işlem, mevcut bağlantınızı tamamen silecek ve tüm paylaşılan anılar, notlar ve özel günler kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                    </p>
                    
                    {!showDisconnectConfirm ? (
                      <button
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300"
                      >
                        Bağlantıyı Sil
                      </button>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-900/50">
                        <p className="text-gray-800 dark:text-gray-200 mb-4 font-semibold">
                          Bu işlemi gerçekleştirmek istediğinize emin misiniz? Tüm verileriniz geri döndürülemez şekilde silinecektir.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleFullDisconnect}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
                          >
                            {isProcessing ? 'İşlem Yapılıyor...' : 'Evet, Bağlantıyı Sil'}
                          </button>
                          <button
                            onClick={() => setShowDisconnectConfirm(false)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
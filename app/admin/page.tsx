'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from './components/AdminLayout';
import { FaUsers, FaBell, FaChartBar, FaCog, FaMobileAlt, FaShoppingCart } from 'react-icons/fa';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConnections: 0,
    activeUsers30Days: 0
  });

  // Admin kontrolü ve istatistikleri yükleme
  useEffect(() => {
    // Oturum kontrolü
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Admin kontrolü
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/auth/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          
          if (!data.isAdmin) {
            router.push('/dashboard');
          } else {
            // İstatistikleri getir
            fetchStats();
          }
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Admin kontrolü hatası:', error);
        router.push('/dashboard');
      }
    };
    
    if (status === 'authenticated') {
      checkAdmin();
    }
  }, [status, router]);

  // İstatistikleri getir
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('İstatistik getirme hatası:', error);
    }
  };

  // Yükleniyor durumu
  if (status === 'loading' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Ana içerik
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Admin Dashboard</h1>
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Toplam Kullanıcı</h3>
              <FaUsers className="text-2xl text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.totalUsers}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Toplam Bağlantı</h3>
              <FaUsers className="text-2xl text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.totalConnections}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Aktif Kullanıcılar</h3>
              <FaChartBar className="text-2xl text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.activeUsers30Days}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Son 30 gün</p>
          </div>
        </div>
        
        {/* Admin Menü Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaUsers className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Kullanıcı Yönetimi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Kullanıcıları görüntüle, düzenle ve yönet
              </p>
            </div>
          </Link>
          
          <Link href="/admin/notifications" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaBell className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Bildirim Gönder</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tüm kullanıcılara veya belirli gruplara bildirim gönder
              </p>
            </div>
          </Link>
          
          <Link href="/admin/analytics" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaChartBar className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">İstatistikler</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Kullanıcı aktiviteleri ve uygulama kullanımı istatistikleri
              </p>
            </div>
          </Link>
          
          <Link href="/admin/settings" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaCog className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Ayarlar</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Uygulama ayarlarını düzenle
              </p>
            </div>
          </Link>
          
          <Link href="/admin/mobile" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaMobileAlt className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Mobil Uygulama</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Mobil uygulama ayarları ve sürüm kontrolü
              </p>
            </div>
          </Link>
          
          <Link href="/admin/billing" className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaShoppingCart className="text-4xl text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Satın Alma Yönetimi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ödeme planları, abonelikler ve satın alma ayarları
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
} 
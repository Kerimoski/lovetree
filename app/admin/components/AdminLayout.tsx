'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaUsers, FaBell, FaChartBar, FaCog, 
  FaMobileAlt, FaShoppingCart, FaTachometerAlt, 
  FaBars, FaTimes, FaSignOutAlt 
} from 'react-icons/fa';
import { signOut } from 'next-auth/react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
    { name: 'Kullanıcılar', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Bildirimler', path: '/admin/notifications', icon: <FaBell /> },
    { name: 'İstatistikler', path: '/admin/analytics', icon: <FaChartBar /> },
    { name: 'Ayarlar', path: '/admin/settings', icon: <FaCog /> },
    { name: 'Mobil Uygulama', path: '/admin/mobile', icon: <FaMobileAlt /> },
    { name: 'Satın Alma', path: '/admin/billing', icon: <FaShoppingCart /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobil menü butonu */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-emerald-600 text-white"
        >
          {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Kenar çubuğu */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-20 w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto`}
      >
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold text-emerald-600">LoveTree Admin</h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg ${
                    pathname === item.path
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="pt-6 mt-6 border-t dark:border-gray-700">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span className="mr-3"><FaSignOutAlt /></span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Sayfa içeriği */}
      <div className="flex-1 overflow-auto lg:ml-64">
        {children}
      </div>
      
      {/* Mobil kenar çubuğu arka planı */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
} 
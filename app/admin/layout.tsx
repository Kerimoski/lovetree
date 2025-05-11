'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin giriş sayfası ise koruma yapma
  const isAuthPage = pathname?.includes('/admin/auth');

  useEffect(() => {
    const checkAdmin = async () => {
      if (status === 'unauthenticated') {
        if (!isAuthPage) {
          router.push('/admin/auth/login');
        }
        setLoading(false);
        return;
      }

      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/admin/auth/check');
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            
            if (!data.isAdmin && !isAuthPage) {
              router.push('/admin/auth/login');
            }
          } else if (!isAuthPage) {
            router.push('/admin/auth/login');
          }
        } catch (error) {
          console.error('Admin kontrolü hatası:', error);
          if (!isAuthPage) {
            router.push('/admin/auth/login');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    checkAdmin();
  }, [status, router, isAuthPage]);

  // Giriş sayfasında ise direkt göster
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Yükleme durumunda
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Admin değilse boş göster (zaten yönlendirilmiş olacak)
  if (!isAdmin) {
    return null;
  }

  // Admin ise içeriği göster
  return <>{children}</>;
} 
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import { FaPaperPlane, FaUsers, FaInfoCircle } from 'react-icons/fa';

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'all', // all, users, segments
    recipients: [] as string[],
    segments: [],
    notificationType: 'SYSTEM',
    url: '',
    data: {}
  });

  // Admin kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/auth/check');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          
          if (!data.isAdmin) {
            router.push('/dashboard');
          } else {
            // Kullanıcıları getir
            fetchUsers();
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

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
    }
  };

  // Form input değişikliği
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Kullanıcı seçimi değişikliği
  const handleUserSelection = (userId: string) => {
    let newRecipients;
    if (formData.recipients.includes(userId)) {
      // Kullanıcı zaten seçiliyse, listeden çıkar
      newRecipients = formData.recipients.filter(id => id !== userId);
    } else {
      // Kullanıcı seçili değilse, listeye ekle
      newRecipients = [...formData.recipients, userId];
    }
    
    setFormData({
      ...formData,
      recipients: newRecipients
    });
  };

  // Bildirim gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSuccess(true);
        // Form temizleme
        setFormData({
          title: '',
          message: '',
          type: 'all',
          recipients: [],
          segments: [],
          notificationType: 'SYSTEM',
          url: '',
          data: {}
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Bildirim gönderilirken bir hata oluştu');
      }
    } catch (error) {
      setError('Bildirim gönderilirken bir hata oluştu');
      console.error('Bildirim gönderme hatası:', error);
    } finally {
      setLoading(false);
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

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Bildirim Gönder</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <FaInfoCircle className="text-emerald-600 mr-2" />
            <p className="text-gray-600 dark:text-gray-300">
              Bu sayfadan tüm kullanıcılara veya belirli kullanıcı gruplarına bildirim gönderebilirsiniz.
            </p>
          </div>
          
          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              Bildirim başarıyla gönderildi!
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                Bildirim Başlığı
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: Yeni Güncelleme"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="message">
                Bildirim Mesajı
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Mesajınızı buraya yazın..."
                rows={4}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="type">
                Bildirim Alıcıları
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Tüm Kullanıcılar</option>
                <option value="segments">Kullanıcı Segmentleri</option>
                <option value="users">Belirli Kullanıcılar</option>
              </select>
            </div>
            
            {formData.type === 'users' && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Kullanıcıları Seçin
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 dark:bg-gray-700 dark:border-gray-600">
                  {users.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Kullanıcı bulunamadı</p>
                  ) : (
                    <ul className="space-y-2">
                      {users.map(user => (
                        <li key={user.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={formData.recipients.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="mr-2 h-4 w-4 text-emerald-600"
                          />
                          <label htmlFor={`user-${user.id}`} className="text-gray-700 dark:text-gray-300">
                            {user.name || 'İsimsiz Kullanıcı'} ({user.email})
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.recipients.length} kullanıcı seçildi
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="notificationType">
                Bildirim Tipi
              </label>
              <select
                id="notificationType"
                name="notificationType"
                value={formData.notificationType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="SYSTEM">Sistem</option>
                <option value="PROMO">Promosyon</option>
                <option value="APP_UPDATE">Uygulama Güncellemesi</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="url">
                Yönlendirme URL (Opsiyonel)
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: https://lovetree.app/dashboard"
              />
            </div>
            
            <button
              type="submit"
              className="flex items-center justify-center bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              {loading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
            </button>
          </form>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Son Gönderilen Bildirimler</h2>
          <p className="text-gray-600 dark:text-gray-400 italic">
            Bu özellik yakında eklenecek.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
} 
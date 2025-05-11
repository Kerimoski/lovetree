'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import { FaSearch, FaUserEdit, FaTrash, FaUserCog } from 'react-icons/fa';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  connectionCount: number;
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Kullanıcılar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
      setError('Kullanıcılar alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı arama
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kullanıcıyı admin yap
  const makeAdmin = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı admin yapmak istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Kullanıcı listesini güncelle
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Kullanıcı admin yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı admin yapma hatası:', error);
      alert('Kullanıcı admin yapılırken bir hata oluştu');
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
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Kullanıcı Yönetimi</h1>
        
        {/* Arama ve filtreler */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="İsim veya email ile ara..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Hata mesajı */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Kullanıcı tablosu */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Arama sonucunda kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Bağlantılar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || 'İsimsiz Kullanıcı'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.connectionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-400 mr-3"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <FaUserEdit className="inline mr-1" /> Düzenle
                        </button>
                        
                        {user.role !== 'ADMIN' && (
                          <button 
                            className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                            onClick={() => makeAdmin(user.id)}
                          >
                            <FaUserCog className="inline mr-1" /> Admin Yap
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 
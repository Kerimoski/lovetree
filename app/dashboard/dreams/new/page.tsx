'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import { FaArrowLeft, FaHome, FaGlobe, FaUserFriends, FaBriefcase, 
         FaHiking, FaHeart, FaMoneyBillWave, FaHeartbeat, FaEllipsisH, FaLink, FaSpinner } from 'react-icons/fa';
import DreamImageUploader from '@/app/components/DreamImageUploader';

// Hayal kategorileri
type DreamCategory = 'TRAVEL' | 'HOME' | 'FAMILY' | 'CAREER' | 'ADVENTURE' | 'RELATIONSHIP' | 'FINANCE' | 'HEALTH' | 'OTHER';

// Kategori tanımları
const categoryInfo: Record<DreamCategory, { color: string; icon: React.ReactNode; title: string }> = {
  TRAVEL: { color: 'bg-blue-500', icon: <FaGlobe />, title: 'Seyahat' },
  HOME: { color: 'bg-yellow-500', icon: <FaHome />, title: 'Ev' },
  FAMILY: { color: 'bg-green-500', icon: <FaUserFriends />, title: 'Aile' },
  CAREER: { color: 'bg-purple-500', icon: <FaBriefcase />, title: 'Kariyer' },
  ADVENTURE: { color: 'bg-orange-500', icon: <FaHiking />, title: 'Macera' },
  RELATIONSHIP: { color: 'bg-pink-500', icon: <FaHeart />, title: 'İlişki' },
  FINANCE: { color: 'bg-emerald-500', icon: <FaMoneyBillWave />, title: 'Finans' },
  HEALTH: { color: 'bg-red-500', icon: <FaHeartbeat />, title: 'Sağlık' },
  OTHER: { color: 'bg-gray-500', icon: <FaEllipsisH />, title: 'Diğer' }
};

export default function NewDreamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DreamCategory>('OTHER');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Resim yükleme işlemi tamamlandığında
  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  // Hayal ekleme fonksiyonu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection) {
      setError('Aktif bağlantı bulunamadı');
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      setError('Başlık ve açıklama alanları zorunludur');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/connections/${activeConnection.id}/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          imageUrl: imageUrl || null,
          linkUrl: linkUrl.trim() || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Hayal eklenirken bir hata oluştu');
      }
      
      // Başarılı olduğunda hayaller sayfasına yönlendir
      router.push('/dashboard/dreams');
      router.refresh();
      
    } catch (err) {
      console.error('Hayal eklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Yükleniyor durumu
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Aktif bağlantı kontrolü
  if (!activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktif bağlantı bulunamadı</h2>
          <p className="text-gray-600 mb-6">Hayal eklemek için bir bağlantıya sahip olmalısınız.</p>
          <Link href="/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard/dreams" className="mr-4 text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-3xl font-bold text-emerald-700">Yeni Hayal Ekle</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Başlık */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Başlık *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Hayalinize bir isim verin"
              required
            />
          </div>
          
          {/* Açıklama */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Açıklama *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Hayalinizi detaylı olarak anlatın"
              rows={5}
              required
            />
          </div>
          
          {/* Kategori */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Kategori
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategorySelector(!showCategorySelector)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <div className="flex items-center">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-white mr-3 ${categoryInfo[category].color}`}>
                    {categoryInfo[category].icon}
                  </span>
                  <span>{categoryInfo[category].title}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showCategorySelector && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  {Object.entries(categoryInfo).map(([cat, info]) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat as DreamCategory);
                        setShowCategorySelector(false);
                      }}
                      className="w-full p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 text-left"
                    >
                      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-white mr-3 ${info.color}`}>
                        {info.icon}
                      </span>
                      <span>{info.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Resim Yükleme */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Görsel (İsteğe Bağlı)
            </label>
            <DreamImageUploader 
              onImageUploaded={handleImageUploaded}
              defaultImage={imageUrl}
            />
          </div>
          
          {/* Bağlantı URL (isteğe bağlı) */}
          <div className="mb-6">
            <label htmlFor="linkUrl" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Bağlantı URL'i (İsteğe Bağlı)
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 dark:bg-gray-700 p-3 rounded-l-lg border border-gray-300 dark:border-gray-600 border-r-0">
                <FaLink className="text-gray-500" />
              </span>
              <input
                type="url"
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://ornek.com"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Hayalinizle ilgili daha fazla bilgi içeren bir site bağlantısı ekleyin</p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              disabled={submitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <span>Hayali Ekle</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
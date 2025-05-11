'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../../context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaHome, FaGlobe, FaUserFriends, FaBriefcase, 
         FaHiking, FaHeart, FaMoneyBillWave, FaHeartbeat, FaRegComment, 
         FaEllipsisH, FaLink, FaUser, FaArrowLeft } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Hayal ve kategorileri için tanımlar
interface Dream {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
  category: DreamCategory;
  position: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  comments: DreamComment[];
}

interface DreamComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

type DreamCategory = 'TRAVEL' | 'HOME' | 'FAMILY' | 'CAREER' | 'ADVENTURE' | 'RELATIONSHIP' | 'FINANCE' | 'HEALTH' | 'OTHER';

// Kategori renkleri ve ikonları
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

export default function DreamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loadingDreams, setLoadingDreams] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DreamCategory | 'ALL'>('ALL');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Hayalleri getir
  useEffect(() => {
    if (!activeConnection) return;
    
    const fetchDreams = async () => {
      try {
        setLoadingDreams(true);
        const response = await fetch(`/api/connections/${activeConnection.id}/dreams`);
        
        if (!response.ok) {
          throw new Error('Hayaller getirilemedi');
        }
        
        const data = await response.json();
        setDreams(data);
      } catch (error) {
        console.error('Hayaller yüklenirken hata:', error);
      } finally {
        setLoadingDreams(false);
      }
    };
    
    fetchDreams();
  }, [activeConnection]);

  // Yorum gönderme işlemi
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDream || !comment.trim() || !activeConnection) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/dreams/${selectedDream.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });
      
      if (!response.ok) {
        throw new Error('Yorum eklenemedi');
      }
      
      const newComment = await response.json();
      
      // Hayaller listesini ve seçili hayali güncelle
      setDreams(dreams.map(dream => 
        dream.id === selectedDream.id 
          ? { ...dream, comments: [...dream.comments, newComment] }
          : dream
      ));
      
      setSelectedDream(prev => prev ? {
        ...prev, 
        comments: [...prev.comments, newComment]
      } : null);
      
      // Yorumu temizle
      setComment('');
    } catch (error) {
      console.error('Yorum gönderilirken hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    } catch (error) {
      return 'geçersiz tarih';
    }
  };

  // Seçili kategoriye göre hayalleri filtrele
  const filteredDreams = activeCategory === 'ALL' 
    ? dreams 
    : dreams.filter(dream => dream.category === activeCategory);

  // Yükleniyor
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktif bağlantı bulunamadı</h2>
          <p className="text-gray-600 mb-6">Hayal panosunu görmek için bir bağlantıya sahip olmalısınız.</p>
          <Link href="/dashboard" className="button-primary">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Ana görünüm
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
            <FaArrowLeft className="text-lg" />
            <span className="text-lg">Dashboard'a Dön</span>
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Hayal Panosu</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Birlikte gerçekleştirmek istediğiniz hayallerinizi keşfedin ve paylaşın
            </p>
          </div>
          
          <Link href="/dashboard/dreams/new" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
            <FaPlus className="text-sm" />
            <span>Yeni Hayal</span>
          </Link>
        </div>
        
        {/* Kategori filtresi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex space-x-3 min-w-max">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                activeCategory === 'ALL'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
              }`}
            >
              <span>Tümü</span>
            </button>
            
            {Object.entries(categoryInfo).map(([category, info]) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as DreamCategory)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  activeCategory === category
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-white ${info.color}`}>
                  {info.icon}
                </span>
                <span>{info.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Görünüm seçenekleri */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredDreams.length} hayal gösteriliyor
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-2 rounded-md ${viewStyle === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`p-2 rounded-md ${viewStyle === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Hayaller */}
        {loadingDreams ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredDreams.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <FaPlus className="text-emerald-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz hiç hayal eklenmemiş</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Birlikte gerçekleştirmek istediğiniz hayallerinizi ekleyerek başlayın.
            </p>
            <Link href="/dashboard/dreams/new" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-md inline-flex items-center gap-2 transition-colors">
              <FaPlus className="text-sm" />
              <span>İlk Hayali Ekle</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Grid view */}
            {viewStyle === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredDreams.map((dream) => (
                  <div 
                    key={dream.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedDream(dream)}
                  >
                    <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700">
                      {dream.imageUrl ? (
                        dream.imageUrl.startsWith('/uploads/') ? (
                          <Image
                            src={dream.imageUrl}
                            alt={dream.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${categoryInfo[dream.category].color}`}>
                            <div className="text-white text-4xl">
                              {categoryInfo[dream.category].icon}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${categoryInfo[dream.category].color}`}>
                          <div className="text-white text-4xl">
                            {categoryInfo[dream.category].icon}
                          </div>
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white ${categoryInfo[dream.category].color}`}>
                        {categoryInfo[dream.category].icon}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{dream.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{dream.description}</p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center text-gray-500">
                          <FaRegComment className="mr-1" />
                          <span>{dream.comments.length}</span>
                        </div>
                        <div className="text-gray-500">{formatDate(dream.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* List view */}
            {viewStyle === 'list' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
                {filteredDreams.map((dream, index) => (
                  <div 
                    key={dream.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer ${
                      index !== filteredDreams.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                    }`}
                    onClick={() => setSelectedDream(dream)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${categoryInfo[dream.category].color}`}>
                        {categoryInfo[dream.category].icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{dream.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{dream.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-gray-500 text-sm mb-1">{formatDate(dream.createdAt)}</div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <FaRegComment className="mr-1" />
                          <span>{dream.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Hayal Detay Modal */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold">{selectedDream.title}</h2>
              <button 
                onClick={() => setSelectedDream(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                    {selectedDream.imageUrl ? (
                      selectedDream.imageUrl.startsWith('/uploads/') ? (
                        <Image
                          src={selectedDream.imageUrl}
                          alt={selectedDream.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center rounded-lg ${categoryInfo[selectedDream.category].color}`}>
                          <div className="text-white text-5xl">
                            {categoryInfo[selectedDream.category].icon}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center rounded-lg ${categoryInfo[selectedDream.category].color}`}>
                        <div className="text-white text-5xl">
                          {categoryInfo[selectedDream.category].icon}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedDream.linkUrl && (
                    <a 
                      href={selectedDream.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaLink />
                      <span className="underline">{selectedDream.linkUrl.length > 40 ? selectedDream.linkUrl.substring(0, 40) + '...' : selectedDream.linkUrl}</span>
                    </a>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${categoryInfo[selectedDream.category].color}`}>
                        {categoryInfo[selectedDream.category].icon}
                      </span>
                      <span className="font-medium">{categoryInfo[selectedDream.category].title}</span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedDream.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {selectedDream.user.image && selectedDream.user.image.startsWith('/uploads/') ? (
                      <Image
                        src={selectedDream.user.image}
                        alt={selectedDream.user.name || 'Kullanıcı'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-600 text-xs" />
                      </div>
                    )}
                    <span>{selectedDream.user.name || 'Kullanıcı'} tarafından</span>
                    <span>•</span>
                    <span>{formatDate(selectedDream.createdAt)}</span>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="font-semibold text-lg mb-3">Yorumlar</h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                    {selectedDream.comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Henüz yorum yok</p>
                    ) : (
                      selectedDream.comments.map((comment) => (
                        <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            {comment.user.image && comment.user.image.startsWith('/uploads/') ? (
                              <Image
                                src={comment.user.image}
                                alt={comment.user.name || 'Kullanıcı'}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <FaUser className="text-gray-600 text-xs" />
                              </div>
                            )}
                            <span className="font-medium text-sm">{comment.user.name || 'Kullanıcı'}</span>
                            <span className="text-gray-500 text-xs">•</span>
                            <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Bir yorum ekleyin..."
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      rows={3}
                      required
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !comment.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
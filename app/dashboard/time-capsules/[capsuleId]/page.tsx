'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaLock, FaLockOpen, FaClock, FaCalendarAlt, FaTrash, FaPen, FaComment } from 'react-icons/fa';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface TimeCapsule {
  id: string;
  title: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  openDate: string;
  isOpened: boolean;
  openedAt: string | null;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  comments: Comment[];
  hiddenUntil?: string;
}

export default function TimeCapsuleDetailPage() {
  // useParams hook ile route parametrelerine erişiyoruz
  const params = useParams();
  const capsuleId = params?.capsuleId as string;

  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection } = useUserContext();
  
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Kapsül verilerini yükle
  useEffect(() => {
    const fetchCapsule = async () => {
      if (!activeConnection || !capsuleId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules/${capsuleId}`);
        
        if (!response.ok) {
          throw new Error('Zaman kapsülü getirilemedi');
        }
        
        const data = await response.json();
        setCapsule(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Zaman kapsülü yüklenirken bir hata oluştu');
        console.error('Zaman kapsülünü getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCapsule();
  }, [activeConnection, capsuleId]);
  
  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Yorum gönderme
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection || !capsule || !comment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules/${capsule.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: comment.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Yorum eklenemedi');
      }
      
      const newComment = await response.json();
      
      // Kapsülü güncelle
      setCapsule(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newComment]
        };
      });
      
      // Yorum alanını temizle
      setComment('');
      
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      alert('Yorum eklenirken bir hata oluştu');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Kapsül açma
  const handleOpenCapsule = async () => {
    if (!activeConnection || !capsule) return;
    
    if (!confirm("Kapsülü açmak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules/${capsule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kapsül açılamadı');
      }
      
      const updatedCapsule = await response.json();
      setCapsule(updatedCapsule);
      alert("Kapsül başarıyla açıldı!");
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kapsül açılırken bir hata oluştu');
      console.error('Kapsül açma hatası:', err);
    }
  };
  
  // Kapsül silme
  const handleDeleteCapsule = async () => {
    if (!activeConnection || !capsule) return;
    
    try {
      const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules/${capsule.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Kapsül silinemedi');
      }
      
      alert('Zaman kapsülü başarıyla silindi');
      router.push('/dashboard/time-capsules');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kapsül silinirken bir hata oluştu');
      console.error('Kapsül silme hatası:', err);
    } finally {
      setDeleteConfirmOpen(false);
    }
  };
  
  // Yükleniyor durumunu göster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  // Hata durumunu göster
  if (error || !capsule) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/dashboard/time-capsules" 
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Zaman Kapsüllerine Dön
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <div className="text-red-600 mb-4">
              <FaLock className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              {error || 'Zaman kapsülü bulunamadı'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aradığınız zaman kapsülü bulunamadı veya erişim izniniz yok.
            </p>
            <Link 
              href="/dashboard/time-capsules"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tüm Kapsüllere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Kapsülün açılma zamanı geldi mi kontrol et
  const now = new Date();
  const openDate = new Date(capsule.openDate);
  const isOpenable = isAfter(now, openDate) && !capsule.isOpened;
  const isCreator = session?.user?.id === capsule.userId;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard/time-capsules" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Zaman Kapsüllerine Dön
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          {/* Kapsül Başlık Bölümü */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {capsule.user.image ? (
                  <Image 
                    src={capsule.user.image} 
                    alt={capsule.user.name || ''} 
                    width={48} 
                    height={48} 
                    className="rounded-full mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-emerald-600 font-semibold text-lg">
                      {capsule.user.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {capsule.isOpened 
                      ? capsule.title
                      : <span className="flex items-center"><FaLock className="mr-2" /> Kilitli Kapsül</span>
                    }
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {capsule.user.name} tarafından {format(new Date(capsule.createdAt), 'd MMMM yyyy', { locale: tr })} tarihinde oluşturuldu
                  </p>
                </div>
              </div>
              
              <div>
                {capsule.isOpened ? (
                  <span className="inline-flex items-center text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                    <FaLockOpen className="mr-1" /> Açık
                  </span>
                ) : (
                  <span className="inline-flex items-center text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                    <FaLock className="mr-1" /> Kilitli
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Kapsül İçeriği */}
          <div className="p-6">
            {/* Açılış Tarihi Bilgisi */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6 flex items-center">
              <FaCalendarAlt className="text-emerald-600 mr-3 text-xl" />
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {capsule.isOpened 
                    ? 'Açılış Tarihi' 
                    : isOpenable
                      ? 'Şimdi Açılabilir'
                      : 'Açılış Tarihi'
                  }
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {capsule.isOpened 
                    ? `${format(new Date(capsule.openDate), 'd MMMM yyyy', { locale: tr })} tarihinde açıldı` 
                    : isOpenable
                      ? 'Açılma zamanı geldi. Kapsülünüzü şimdi açabilirsiniz!'
                      : `${format(new Date(capsule.openDate), 'd MMMM yyyy', { locale: tr })} tarihinde açılacak (${formatDistanceToNow(new Date(capsule.openDate), { locale: tr, addSuffix: true })})`
                  }
                </p>
              </div>
            </div>
            
            {/* Kapsül İçeriği (Kilitli ya da Açık) */}
            {capsule.isOpened ? (
              // Açılmış kapsül içeriği
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {capsule.description}
                </p>
                
                {capsule.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden relative" style={{ height: '300px' }}>
                    <Image 
                      src={capsule.imageUrl} 
                      alt={capsule.title} 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {capsule.content && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">
                      Kapsül İçeriği
                    </h3>
                    <div className="prose prose-emerald dark:prose-invert max-w-none">
                      {capsule.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isOpenable ? (
              // Açılabilir kapsül
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-8 mb-6 text-center">
                <FaLock className="mx-auto text-5xl text-amber-500 mb-4" />
                <h3 className="font-medium text-amber-800 dark:text-amber-400 text-xl mb-4 flex items-center justify-center">
                  Bu Kapsülün Kilidi Açılabilir
                </h3>
                <p className="text-amber-700 dark:text-amber-500 mb-6">
                  Kapsülün açılma zamanı geldi. Kapsülü açtığınızda içeriği görüntüleyebilirsiniz.
                </p>
                <button
                  onClick={handleOpenCapsule}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                >
                  <FaLockOpen className="mr-2" /> Kapsülü Aç
                </button>
              </div>
            ) : (
              // Kilitli kapsül
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
                <FaLock className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  Bu kapsül kilitli
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Bu kapsülün içeriği {format(new Date(capsule.openDate), 'd MMMM yyyy', { locale: tr })} tarihinde açılabilecek.
                </p>
              </div>
            )}
            
            {/* Kapsülü Silme veya Düzenleme Butonları */}
            {isCreator && !capsule.isOpened && (
              <div className="flex justify-end space-x-3 mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                >
                  <FaTrash className="mr-1" /> Sil
                </button>
                
                <Link 
                  href={`/dashboard/time-capsules/${capsule.id}/edit`}
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <FaPen className="mr-1" /> Düzenle
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Yorumlar Bölümü */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-6 flex items-center">
              <FaComment className="mr-2 text-emerald-600" /> Yorumlar
            </h3>
            
            {/* Yorum Formu */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-3">
                <div className="flex-grow">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bir yorum yazın..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !comment.trim()}
                    className="h-full px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? '...' : 'Gönder'}
                  </button>
                </div>
              </div>
            </form>
            
            {/* Yorumlar Listesi */}
            {capsule.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </div>
            ) : (
              <div className="space-y-6">
                {capsule.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    {comment.user.image ? (
                      <Image 
                        src={comment.user.image} 
                        alt={comment.user.name || ''} 
                        width={40} 
                        height={40} 
                        className="rounded-full h-10 w-10"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold">
                          {comment.user.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800 dark:text-white">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(comment.createdAt), 'd MMM yyyy HH:mm', { locale: tr })}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Silme Onay Modalı */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Kapsülü Silmek İstediğinize Emin Misiniz?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bu işlem geri alınamaz ve tüm kapsül içeriği kalıcı olarak silinir.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCapsule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Kapsülü Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
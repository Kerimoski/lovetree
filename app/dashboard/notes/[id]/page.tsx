'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import { FaArrowLeft, FaStar, FaRegStar, FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Note {
  id: string;
  title: string;
  content: string;
  rating: number | null;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function NoteDetailPage() {
  // useParams ile route parametrelerini al
  const params = useParams();
  const noteId = params.id as string;
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading, currentUser } = useUserContext();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  
  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Not detayını getir
  useEffect(() => {
    const fetchNoteDetail = async () => {
      if (!activeConnection || !noteId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/notes/${noteId}`);
        
        if (!response.ok) {
          throw new Error('Not detayı getirilemedi');
        }
        
        const data = await response.json();
        setNote(data);
        setRating(data.rating);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Not detayı yüklenirken bir hata oluştu');
        console.error('Not detayı getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoteDetail();
  }, [activeConnection, noteId]);

  // Not değişikliklerini izle
  useEffect(() => {
    // Bu bileşen mount edildiğinde veya id değiştiğinde çalışacak
    console.log('Not ID:', noteId);
  }, [noteId]);

  // Notu puanla
  const handleRateNote = async (selectedRating: number) => {
    if (!activeConnection || !noteId || !currentUser) return;
    
    // Kendi notunuzu puanlayamazsınız
    if (note?.authorId === currentUser.id) {
      alert('Kendi notunuzu puanlayamazsınız');
      return;
    }
    
    try {
      setIsRating(true);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/notes/${noteId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: selectedRating }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Not puanlanamadı');
      }
      
      const updatedNote = await response.json();
      setNote(updatedNote);
      setRating(selectedRating);
      
    } catch (err) {
      console.error('Not puanlama hatası:', err);
      alert(err instanceof Error ? err.message : 'Not puanlanırken bir hata oluştu');
    } finally {
      setIsRating(false);
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

  // Aktif bağlantı yoksa
  if (!activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aktif Bağlantı Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bu bölümü kullanabilmek için önce bir bağlantı kurmanız gerekiyor.
          </p>
          <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }

  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    } catch (error) {
      return 'geçersiz tarih';
    }
  };

  // Puanlama yıldızları bileşeni
  const RatingStars = () => {
    // Not yazan kişi kendi notunu puanlayamaz
    const isOwnNote = note?.authorId === currentUser?.id;

    // Debug amaçlı kontrol ediyoruz
    console.log("Not author ID:", note?.authorId);
    console.log("Current user ID:", currentUser?.id);
    console.log("Is own note:", isOwnNote);
    console.log("Current rating:", rating);
    console.log("Not ID:", noteId);
    
    return (
      <div className="flex items-center gap-1 mt-4">
        <span className="text-gray-600 dark:text-gray-400 mr-2">Puan Ver:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isOwnNote && handleRateNote(star)}
            onMouseEnter={() => !isOwnNote && setHoverRating(star)}
            onMouseLeave={() => !isOwnNote && setHoverRating(null)}
            disabled={isRating || isOwnNote}
            className={`text-2xl focus:outline-none transition-colors ${isOwnNote ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isOwnNote ? 'Kendi notunuzu puanlayamazsınız' : `${star} yıldız`}
          >
            {(!isOwnNote && hoverRating !== null) ? (
              star <= hoverRating ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-400" />
              )
            ) : (
              (rating !== null && star <= rating) ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-400" />
              )
            )}
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {isOwnNote 
            ? '(Kendi notunuzu puanlayamazsınız)' 
            : rating 
              ? `(Mevcut puan: ${rating})` 
              : ''}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard/notes" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Notlara Dön
          </Link>
        </div>
      
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : note ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Not başlığı */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{note.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                <div className="flex items-center">
                  <FaUser className="mr-2" /> 
                  {note.author.name || 'İsimsiz Kullanıcı'}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" /> 
                  {formatDate(note.createdAt)}
                </div>
              </div>
            </div>
            
            {/* Not içeriği */}
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>
              
              {/* Puanlama sistemi */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <RatingStars />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Not Bulunamadı</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Aradığınız not bulunamadı veya silinmiş olabilir.
              </p>
              <Link 
                href="/dashboard/notes" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Notlara Dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
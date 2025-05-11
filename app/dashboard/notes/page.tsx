'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlus, FaStickyNote, FaTrash, FaUser, FaClock, FaArrowLeft } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection, loading } = useUserContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Notları getir
  useEffect(() => {
    const fetchNotes = async () => {
      if (!activeConnection) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/connections/${activeConnection.id}/notes`);
        
        if (!response.ok) {
          throw new Error('Notlar getirilemedi');
        }
        
        const data = await response.json();
        setNotes(data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Notlar yüklenirken bir hata oluştu');
        console.error('Notları getirme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [activeConnection]);

  // Not silme işlemi
  const handleDeleteNote = async (noteId: string) => {
    if (!activeConnection) return;
    
    try {
      setDeleteLoading(noteId);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Not silinemedi');
      }
      
      // Başarıyla silinen notu listeden kaldır
      setNotes(notes.filter(note => note.id !== noteId));
      
    } catch (err) {
      console.error('Not silme hatası:', err);
      alert('Not silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Dashboard'a Dön
          </Link>
        </div>
      
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">Notlar Panonuz</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Birbirinizle özel notlar paylaşın
            </p>
          </div>
          <Link 
            href="/dashboard/notes/new" 
            className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus className="mr-2" /> Not Ekle
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="max-w-md mx-auto">
              <FaStickyNote className="text-5xl text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Henüz Not Yok</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Birbirinize özel notlar bırakarak iletişiminizi güçlendirin. 
                Sevdiğiniz kişiye bir mesaj bırakmak için ilk notunuzu ekleyin.
              </p>
              <Link 
                href="/dashboard/notes/new" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
              >
                <FaPlus className="mr-2" /> İlk Notunuzu Ekleyin
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                {/* Üst kısım - başlık ve silme butonu */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {note.title}
                  </h3>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deleteLoading === note.id}
                    className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                    aria-label="Notu sil"
                  >
                    {deleteLoading === note.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                    ) : (
                      <FaTrash size={14} />
                    )}
                  </button>
                </div>
                
                {/* Not içeriği ve alt bilgiler */}
                <Link href={`/dashboard/notes/${note.id}`}>
                  <div className="p-4 cursor-pointer">
                    <div className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                      {note.content}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <FaUser className="mr-1" /> 
                        {note.author.name || 'İsimsiz Kullanıcı'}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-1" /> 
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
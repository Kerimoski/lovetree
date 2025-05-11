'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '../context/UserContext';
import { FaPlus, FaTree, FaCalendarAlt, FaStickyNote, FaHistory, FaPaperPlane, FaCog, FaUser, FaSpotify, FaClipboardList, FaGift, FaCamera, FaCloudSun, FaLock, FaComments, FaBell, FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import SpotifyPlaylist from '../components/SpotifyPlaylist';

// Not tipi tanımı
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

// Dashboard özellik kartlarını burada güncelle, zaman kapsülü özelliğini ekleyerek
const features = [
  {
    title: 'Anılar',
    icon: <FaCamera className="text-4xl text-amber-500" />,
    description: 'Birlikte yaşadığınız özel anıları biriktirin.',
    path: '/dashboard/memories',
    bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30', 
    borderClass: 'border-amber-200 dark:border-amber-800/30',
    hoverClass: 'hover:shadow-amber-200/50 dark:hover:shadow-amber-700/30' 
  },
  {
    title: 'Özel Günler',
    icon: <FaCalendarAlt className="text-4xl text-red-500" />,
    description: 'Önemli tarihleri ve özel günleri kaydedin.',
    path: '/dashboard/special-days',
    bgClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30',
    borderClass: 'border-red-200 dark:border-red-800/30',
    hoverClass: 'hover:shadow-red-200/50 dark:hover:shadow-red-700/30'
  },
  {
    title: 'Notlar',
    icon: <FaStickyNote className="text-4xl text-emerald-500" />,
    description: 'Birbirinize özel mesajlar ve notlar gönderin.',
    path: '/dashboard/notes',
    bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/30',
    hoverClass: 'hover:shadow-emerald-200/50 dark:hover:shadow-emerald-700/30'
  },
  {
    title: 'Hayal Panosu',
    icon: <FaCloudSun className="text-4xl text-blue-500" />,
    description: 'Geleceğe dair hayallerinizi planlayın.',
    path: '/dashboard/dreams',
    bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30',
    borderClass: 'border-blue-200 dark:border-blue-800/30',
    hoverClass: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-700/30'
  },
  {
    title: 'Sürprizler',
    icon: <FaGift className="text-4xl text-purple-500" />,
    description: 'Eşinize özel sürpriz görsel ve mesajlar paylaşın.',
    path: '/dashboard/surprises',
    bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30',
    borderClass: 'border-purple-200 dark:border-purple-800/30',
    hoverClass: 'hover:shadow-purple-200/50 dark:hover:shadow-purple-700/30'
  },
  {
    title: 'Zaman Kapsülleri',
    icon: <FaLock className="text-4xl text-rose-500" />,
    description: 'Gelecekte açılmak üzere özel anılar saklayın.',
    path: '/dashboard/time-capsules',
    bgClass: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/30',
    borderClass: 'border-rose-200 dark:border-rose-800/30',
    hoverClass: 'hover:shadow-rose-200/50 dark:hover:shadow-rose-700/30'
  }
];

// Dashboard ana sayfa
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { connections, activeConnection, loading, error, setActiveConnection } = useUserContext();
  const [connectionCode, setConnectionCode] = useState('');
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [isPairingWithCode, setIsPairingWithCode] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [upcomingSpecialDays, setUpcomingSpecialDays] = useState<any[]>([]);
  const [loadingSpecialDays, setLoadingSpecialDays] = useState(false);

  // Oturum kontrolü
  useEffect(() => {
    console.log('Oturum durumu:', status);
    console.log('Oturum bilgisi:', session);
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, session]);

  // Bağlantı kodunu oluştur
  const createConnectionCode = async () => {
    try {
      setIsCreatingCode(true);
      setCodeError('');
      
      console.log('Bağlantı kodu oluşturma isteği gönderiliyor...');
      
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Oturum bilgilerini gönder
        body: JSON.stringify({}) // Boş bir nesne gönder
      });
      
      console.log('API yanıtı:', response.status, response.statusText);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('API yanıt verisi:', responseData);
      } catch(jsonError) {
        console.error('JSON ayrıştırma hatası:', jsonError);
        throw new Error('API yanıtı ayrıştırılamadı');
      }
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Bağlantı kodu oluşturulamadı');
      }
      
      setConnectionCode(responseData.connectionCode);
      
    } catch (err) {
      console.error('Bağlantı kodu oluşturma hatası:', err);
      setCodeError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsCreatingCode(false);
    }
  };

  // Kod ile eşleşme
  const pairWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pairingCode.trim()) {
      setPairingError('Lütfen bir kod girin');
      return;
    }
    
    try {
      setIsPairingWithCode(true);
      setPairingError('');
      
      const response = await fetch('/api/connections/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionCode: pairingCode })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eşleşme başarısız oldu');
      }
      
      // Başarılı eşleşme sonrası sayfayı yenile
      window.location.reload();
      
    } catch (err) {
      setPairingError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsPairingWithCode(false);
    }
  };

  // Aktif bağlantı varken son notları ve yaklaşan özel günleri getir
  useEffect(() => {
    if (!activeConnection || !activeConnection.id) return;
    
    console.log('Dashboard: Aktif bağlantı var, verileri getiriyorum', activeConnection.id);
    
    // Son notları getir
    const fetchRecentNotes = async () => {
      try {
        setLoadingNotes(true);
        
        if (!activeConnection.id) {
          console.log('Geçerli bir bağlantı ID\'si bulunamadı. Notlar getirilemiyor.');
          return;
        }
        
        const response = await fetch(`/api/connections/${activeConnection.id}/notes`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Bu bağlantı için henüz notlar oluşturulmamış.');
            setRecentNotes([]);
            return;
          }
          console.error('Son notları alma hatası:', response.status);
          return;
        }
        
        const notes = await response.json();
        // Sadece en son 3 notu al
        setRecentNotes(notes.slice(0, 3));
        
      } catch (err) {
        console.error('Son notları getirme hatası:', err);
        setRecentNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };
    
    // Yaklaşan özel günleri getir
    const fetchUpcomingSpecialDays = async () => {
      try {
        setLoadingSpecialDays(true);
        
        if (!activeConnection.id) {
          console.log('Geçerli bir bağlantı ID\'si bulunamadı. Özel günler getirilemiyor.');
          return;
        }
        
        const response = await fetch(`/api/connections/${activeConnection.id}/special-days`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Bu bağlantı için henüz özel günler oluşturulmamış.');
            setUpcomingSpecialDays([]);
            return;
          }
          console.error('Özel günleri alma hatası:', response.status);
          return;
        }
        
        const specialDays = await response.json();
        
        // Gelecek ve bugünkü özel günleri filtrele ve tarihe göre sırala
        const upcoming = specialDays
          .filter((day: any) => day.daysLeft >= 0) 
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .slice(0, 3); // İlk 3 özel günü al
        
        setUpcomingSpecialDays(upcoming);
      } catch (err) {
        console.error('Özel günleri getirme hatası:', err);
        setUpcomingSpecialDays([]);
      } finally {
        setLoadingSpecialDays(false);
      }
    };
    
    fetchRecentNotes();
    fetchUpcomingSpecialDays();
  }, [activeConnection]);

  // Yükleniyor durumu
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Kontrollü durum başlangıcı
  console.log('Dashboard: Aktif bağlantı durumu:', !!activeConnection);
  console.log('Dashboard: Bağlantı sayısı:', connections.length);

  // Aktif bağlantı varsa içerik göster
  if (activeConnection) {
    const partner = activeConnection.userId === session?.user?.id 
      ? activeConnection.pairedWith 
      : activeConnection.user;
    
    console.log('Dashboard: Aktif bağlantı ID:', activeConnection.id);
    console.log('Dashboard: Kullanıcı ID:', session?.user?.id);
    console.log('Dashboard: Eşleşilen kullanıcı:', partner?.name);
    
    // Ağaç bilgilerini al
    const treeInfo = activeConnection.tree || { growthLevel: 1, lastWatered: new Date().toISOString(), growthXP: 0 };
    const growthLevel = treeInfo.growthLevel || 1;
    const maxLevel = 3; // Maksimum seviye
    
    // Seviye kontrolü (1-3 arası)
    const safeLevel = Math.min(Math.max(growthLevel, 1), maxLevel);
    
    // Seviyeye göre görsel ve ilerleme hesaplamaları
    const treeImage = `/images/tree${safeLevel}.png`;
    
    // XP ve ilerleme hesaplamaları
    const xpTotal = 'growthXP' in treeInfo ? treeInfo.growthXP : 0;
    const xpPerLevel = 1000; // Her seviye için gereken XP
    const nextLevelXP = safeLevel < maxLevel ? (safeLevel * xpPerLevel) : null;
    
    // Bir sonraki seviyeye ilerleme yüzdesi
    const progressPercentage = nextLevelXP 
      ? Math.min(100, Math.floor((xpTotal % xpPerLevel) / (xpPerLevel / 100)))
      : 100;
      
    const lastWatered = new Date(treeInfo.lastWatered).toLocaleDateString('tr-TR');
    
    // Seviye açıklamaları
    const levelDescriptions = [
      "Ağacınız büyümeye başlıyor. Birbirinizle daha çok anı paylaşarak onu büyütün!",
      "Ağacınız büyüyor! Devam ederek daha da güçlü bir hale getirin.",
      "Ağacınız tam olgunluğa ulaştı. Harika bir bağınız var!"
    ];

    // Notlarda tarih formatı için yardımcı fonksiyon
    const formatNoteDate = (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
      } catch (error) {
        return 'geçersiz tarih';
      }
    };

    // Tarih formatı
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Modern Header */}
          <header className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">Merhaba, {session?.user?.name || 'Kullanıcı'}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <FaHeart className="text-pink-500 mr-2" />
                <span className="font-semibold">{partner?.name || 'Partner'}</span> ile bağlantınız
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/chat" className="bg-gray-100 hover:bg-emerald-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 rounded-full transition-colors shadow-sm hover:shadow">
                <FaComments className="text-emerald-600 text-xl" />
              </Link>
              <Link href="/dashboard/settings" className="bg-gray-100 hover:bg-emerald-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-3 rounded-full transition-colors shadow-sm hover:shadow">
                <FaCog className="text-emerald-600 text-xl" />
              </Link>
            </div>
          </header>
          
          {/* Ağaç Durumu - Modern Tasarım */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-transparent dark:from-emerald-900/10 dark:to-transparent rounded-bl-full -z-0 opacity-70"></div>
            <div className="flex flex-col md:flex-row items-center relative z-10">
              <div className="w-40 h-40 md:w-56 md:h-56 relative mb-6 md:mb-0 md:mr-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-2 transition-all duration-300 hover:scale-105">
                <Image 
                  src={treeImage}
                  alt={`İlişki Ağacınız - Seviye ${safeLevel}`} 
                  width={200} 
                  height={200}
                  className="object-contain transition-all duration-300 drop-shadow-md"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-3 flex items-center">
                  <FaTree className="mr-2 text-emerald-600" /> İlişki Ağacınız
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ağacınız şu anda <span className="font-bold text-emerald-600 dark:text-emerald-400">seviye {safeLevel}</span>'de. 
                  {safeLevel < maxLevel ? 
                    ` Seviye ${safeLevel + 1}'e ulaşmak için birlikte daha çok zaman geçirin.` : 
                    " Maksimum seviyeye ulaştınız!"}
                </p>
                
                <div className="relative pt-1 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold inline-block text-emerald-600">
                        İlerleme
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold inline-block text-emerald-600">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                  <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-700 ease-out shadow-inner" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border-l-4 border-emerald-500">
                  {levelDescriptions[safeLevel - 1]}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <strong>{xpTotal}</strong> XP
                  </span>
                  {nextLevelXP ? (
                    <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      Hedef: <strong>{nextLevelXP}</strong> XP
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full font-semibold">
                      Maksimum Seviye
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                  <FaHistory className="mr-2 text-gray-400" /> 
                  Son sulama: {lastWatered}
                </p>
              </div>
            </div>
          </div>

          {/* Etkinlikler - Modern Kart Tasarımı */}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-5 pl-2 border-l-4 border-emerald-500">Etkinlikleriniz</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {features.map((feature) => (
              <Link
                key={feature.path}
                href={feature.path}
                className={`${feature.bgClass} border ${feature.borderClass} rounded-xl shadow-md p-6 hover:shadow-lg ${feature.hoverClass} transition-all duration-300 flex flex-col h-full group`}
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-auto">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
            
              {/* Spotify Playlist Bileşeni 
          <div className="w-full mb-8">
            <SpotifyPlaylist connectionId={activeConnection.id} />
          </div> */}

          {/* Yaklaşan Etkinlikler & Son Notlar - Modern Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-500" /> Yaklaşan Özel Günler
                </h3>
                <Link href="/dashboard/special-days" className="text-sm text-emerald-600 hover:text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  Tümünü Gör
                </Link>
              </div>
              
              {loadingSpecialDays ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : upcomingSpecialDays.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="mb-3 text-4xl text-gray-300 dark:text-gray-600">
                    <FaCalendarAlt className="mx-auto" />
                  </div>
                  <p>Yaklaşan özel gün bulunmuyor.</p>
                  <Link href="/dashboard/special-days/new" className="mt-3 inline-flex items-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                    <FaPlus className="mr-1" /> Özel gün ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSpecialDays.map((specialDay) => (
                    <div 
                      key={specialDay.id}
                      className={`p-4 rounded-lg transition-all duration-300 border-l-4 
                        ${specialDay.isToday 
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-700/30' 
                          : 'border-blue-400 hover:bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 hover:shadow-lg'}
                        ${!specialDay.isConfirmed ? 'opacity-80' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white text-lg">{specialDay.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center">
                            <FaCalendarAlt className="mr-1 text-blue-500" />
                            {formatDate(specialDay.date)}
                            {specialDay.isRecurring && 
                              <span className="ml-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">Yıllık</span>
                            }
                          </p>
                        </div>
                        <div className={`text-sm font-semibold rounded-full px-3 py-1.5
                          ${specialDay.isToday 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}
                        `}>
                          {specialDay.isToday ? 'Bugün!' : `${specialDay.daysLeft} gün`}
                        </div>
                      </div>
                      
                      {!specialDay.isConfirmed && (
                        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md inline-block">
                          <FaBell className="mr-1" /> 
                          {specialDay.userId === session?.user?.id
                            ? 'Partnerinizin onayı bekleniyor'
                            : 'Onayınızı bekliyor'}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-3 text-center">
                    <Link 
                      href="/dashboard/special-days/new" 
                      className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <FaPlus className="mr-2 text-xs" /> Yeni Özel Gün Ekle
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center">
                  <FaStickyNote className="mr-2 text-emerald-500" /> Son Notlar
                </h3>
                <Link href="/dashboard/notes" className="text-sm text-emerald-600 hover:text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  Tümünü Gör
                </Link>
              </div>
              
              {loadingNotes ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : recentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="mb-3 text-4xl text-gray-300 dark:text-gray-600">
                    <FaStickyNote className="mx-auto" />
                  </div>
                  <p>Henüz not bulunmuyor.</p>
                  <Link href="/dashboard/notes/new" className="mt-3 inline-flex items-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                    <FaPlus className="mr-1" /> Not ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-md bg-gradient-to-r from-transparent from-90% to-emerald-50/30 dark:to-emerald-900/10">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800 dark:text-white line-clamp-1 text-lg">{note.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{formatNoteDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded">{note.content}</p>
                      <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {note.author.image ? (
                          <Image
                            src={note.author.image}
                            alt={note.author.name || 'Kullanıcı'}
                            width={20}
                            height={20}
                            className="rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-2">
                            <FaUser className="text-xs text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <span>{note.author.name || 'Anonim'}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-3 text-center">
                    <Link 
                      href="/dashboard/notes/new" 
                      className="text-sm text-emerald-600 hover:text-emerald-700 inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <FaPlus className="mr-2 text-xs" /> Yeni Not Ekle
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Eşleşme olmadığında bağlantı oluşturma/eşleşme ekranı
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-3">Hoş Geldiniz!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sevdiklerinizle özel bir bağ oluşturmak için başlayın
          </p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Bağlantı kodu oluştur */}
          <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-2">
                <Image 
                  src="/lovetreelogo.png" 
                  alt="LoveTree Logo" 
                  width={80} 
                  height={80}
                  className="object-contain drop-shadow-md"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-4 text-center">Bağlantı Başlat</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Bir bağlantı kodu oluşturun ve bunu özel kişinizle paylaşın
            </p>
            
            {connectionCode ? (
              <div className="text-center">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-5 rounded-lg mb-4 border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bağlantı kodunuz:</p>
                  <p className="text-2xl font-bold text-emerald-700 tracking-wider">{connectionCode}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Bu kodu sevdiğiniz kişiyle paylaşın. Onlar bu kodu kullanarak sizinle bağlantı kurabilir.
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(connectionCode)}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                >
                  Kodu Kopyala
                </button>
              </div>
            ) : (
              <div>
                {codeError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    {codeError}
                  </div>
                )}
                <button
                  onClick={() => {
                    console.log('Buton tıklandı - createConnectionCode fonksiyonu çağrılıyor');
                    createConnectionCode();
                  }}
                  disabled={isCreatingCode}
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingCode ? 'Oluşturuluyor...' : 'Bağlantı Kodu Oluştur'}
                </button>
              </div>
            )}
          </div>

          {/* Bağlantı kodu ile eşleş */}
          <div className="md:w-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <FaPlus className="text-3xl text-emerald-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-4 text-center">Bağlantıya Katıl</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Elinizde bir bağlantı kodu varsa, buradan eşleşebilirsiniz
            </p>
            
            <form onSubmit={pairWithCode}>
              {pairingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {pairingError}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="connectionCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bağlantı Kodu
                </label>
                <input
                  type="text"
                  id="connectionCode"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Örn: ABC123"
                  maxLength={6}
                />
              </div>
              
              <button
                type="submit"
                disabled={isPairingWithCode}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPairingWithCode ? 'Eşleşiyor...' : 'Bağlantıya Katıl'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
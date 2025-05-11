'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Kullanıcı tipi
interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

// Bağlantı tipi
interface Connection {
  id: string;
  connectionCode: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  pairedWithId: string | null;
  user: User | null;
  pairedWith: User | null;
  tree: Tree | null;
}

interface Tree {
  id: string;
  growthLevel: number;
  lastWatered: string;
  growthXP: number;
}

// Kontekst tipleri
interface UserContextType {
  connections: Connection[];
  activeConnection: Connection | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  fetchConnections: () => Promise<void>;
  setActiveConnection: (connection: Connection | null) => void;
  refreshConnections: () => Promise<void>;
}

// Varsayılan değerler
const defaultContext: UserContextType = {
  connections: [],
  activeConnection: null,
  currentUser: null,
  loading: false,
  error: null,
  fetchConnections: async () => {},
  setActiveConnection: () => {},
  refreshConnections: async () => {},
};

// Kontekst oluşturma
const UserContext = createContext<UserContextType>(defaultContext);

// Kontekst sağlayıcı
export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  // Kullanıcı bilgisini güncelle
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentUser({
        id: session.user.id as string,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      });
    } else {
      setCurrentUser(null);
    }
  }, [session, status]);

  // Bağlantıları getir
  const fetchConnections = async () => {
    if (status !== 'authenticated' || !session) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Mevcut kullanıcı ID'sini al
      const currentUserId = session.user.id;
      
      const response = await fetch('/api/connections');
      
      if (!response.ok) {
        throw new Error('Bağlantılar getirilemedi');
      }
      
      const data = await response.json();
      console.log('Alınan bağlantılar:', data);
      setConnections(data);
      
      // Kullanıcı değişmiş veya aktif bağlantı kullanıcıya ait değilse sıfırla
      if (lastFetchedUserId !== currentUserId || 
         (activeConnection && 
          activeConnection.userId !== currentUserId && 
          activeConnection.pairedWithId !== currentUserId)) {
        console.log('Kullanıcı değişmiş veya aktif bağlantı uyumsuz, aktif bağlantı sıfırlanıyor');
        setActiveConnection(null);
      }
      
      // Kullanıcı ID'sini güncelle
      setLastFetchedUserId(currentUserId);
      
      // Aktif bağlantıyı güncelle
      if (data.length > 0 && !activeConnection) {
        console.log('Aktif bağlantı seçiliyor (mevcut kullanıcı ID):', currentUserId);
        
        // Sadece mevcut kullanıcıya ait olan eşleşmiş bağlantıları filtrele
        const pairedConnections = data.filter((conn: Connection) => 
          conn.pairedWithId !== null && 
          (conn.userId === currentUserId || conn.pairedWithId === currentUserId)
        );
        
        if (pairedConnections.length > 0) {
          console.log('Aktif eşleşmiş bağlantı bulundu:', pairedConnections[0]);
          setActiveConnection(pairedConnections[0]);
        } else {
          // Eşleşmemiş bağlantıları kontrol et
          const unpaired = data.filter((conn: Connection) => 
            conn.pairedWithId === null && 
            conn.userId === currentUserId
          );
          
          if (unpaired.length > 0) {
            console.log('Aktif eşleşmemiş bağlantı bulundu:', unpaired[0]);
            setActiveConnection(unpaired[0]);
          } else {
            // Hiç bağlantı yoksa null olarak ayarla
            console.log('Kullanıcıya ait bir bağlantı bulunamadı');
            setActiveConnection(null);
          }
        }
      } else if (activeConnection) {
        // Aktif bağlantı zaten var, mevcut kullanıcıya ait olup olmadığını kontrol et
        const isUserConnection = 
          activeConnection.userId === currentUserId || 
          activeConnection.pairedWithId === currentUserId;
        
        if (!isUserConnection) {
          console.log('Mevcut aktif bağlantı bu kullanıcıya ait değil, sıfırlanıyor');
          setActiveConnection(null);
          
          // Kullanıcıya ait bağlantı var mı kontrol et
          if (data.length > 0) {
            const userConnections = data.filter((conn: Connection) => 
              conn.userId === currentUserId || conn.pairedWithId === currentUserId
            );
            
            if (userConnections.length > 0) {
              console.log('Kullanıcıya ait yeni bağlantı seçiliyor:', userConnections[0]);
              setActiveConnection(userConnections[0]);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Bağlantı getirme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Bağlantıları yenile
  const refreshConnections = async () => {
    await fetchConnections();
  };

  // Oturum değişince bağlantıları getir
  useEffect(() => {
    if (status === 'authenticated') {
      fetchConnections();
    } else if (status === 'unauthenticated') {
      // Oturum yoksa tüm durum değişkenlerini sıfırla
      setConnections([]);
      setActiveConnection(null);
      setLastFetchedUserId(null);
    }
  }, [status, session]);

  return (
    <UserContext.Provider 
      value={{
        connections,
        activeConnection,
        currentUser,
        loading,
        error,
        fetchConnections,
        setActiveConnection,
        refreshConnections,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Kullanım kolaylığı için hook
export const useUserContext = () => useContext(UserContext); 
// Firebase veritabanı işlemleri için servis
import { db, realtime } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, set, get, update } from 'firebase/database';

// Firestore veri tipleri
interface FirestoreMemory {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  date: string;
  userId: string;
  connectionId: string;
  createdAt: string;
}

interface FirestoreConnection {
  id: string;
  userId: string;
  pairedWithId: string | null;
  code: string | null;
  status: string;
  createdAt: string;
}

/**
 * Firestore - Anı ekle/güncelle
 */
export async function saveMemoryToFirestore(memory: FirestoreMemory) {
  try {
    if (!db) throw new Error('Firestore başlatılamadı');
    
    await setDoc(doc(db, 'memories', memory.id), memory);
    return { success: true };
  } catch (error) {
    console.error('Firestore anı kaydetme hatası:', error);
    return { success: false, error };
  }
}

/**
 * Firestore - Bağlantıya ait anıları getir
 */
export async function getConnectionMemoriesFromFirestore(connectionId: string) {
  try {
    if (!db) throw new Error('Firestore başlatılamadı');
    
    const memoriesRef = collection(db, 'memories');
    const q = query(memoriesRef, where('connectionId', '==', connectionId));
    const querySnapshot = await getDocs(q);
    
    const memories: FirestoreMemory[] = [];
    querySnapshot.forEach((doc) => {
      memories.push(doc.data() as FirestoreMemory);
    });
    
    return { success: true, memories };
  } catch (error) {
    console.error('Firestore anıları getirme hatası:', error);
    return { success: false, error };
  }
}

/**
 * Firestore - Bağlantı ekle/güncelle
 */
export async function saveConnectionToFirestore(connection: FirestoreConnection) {
  try {
    if (!db) throw new Error('Firestore başlatılamadı');
    
    await setDoc(doc(db, 'connections', connection.id), connection);
    return { success: true };
  } catch (error) {
    console.error('Firestore bağlantı kaydetme hatası:', error);
    return { success: false, error };
  }
}

/**
 * Realtime Database - Kullanıcı çevrimiçi durumunu güncelle
 */
export async function updateUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    if (!realtime) throw new Error('Realtime Database başlatılamadı');
    
    const userStatusRef = ref(realtime, `/status/${userId}`);
    await set(userStatusRef, {
      online: isOnline,
      lastSeen: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Realtime Database durum güncelleme hatası:', error);
    return { success: false, error };
  }
}

/**
 * Realtime Database - Kullanıcı durum bilgisini al
 */
export async function getUserStatus(userId: string) {
  try {
    if (!realtime) {
      console.warn('Realtime Database başlatılamadı');
      return { success: true, status: { online: false, lastSeen: null } };
    }
    
    if (!userId) {
      console.warn('Geçersiz kullanıcı ID', userId);
      return { success: true, status: { online: false, lastSeen: null } };
    }
    
    try {
      const userStatusRef = ref(realtime, `/status/${userId}`);
      const snapshot = await get(userStatusRef);
      
      if (snapshot.exists()) {
        return { success: true, status: snapshot.val() };
      } else {
        return { success: true, status: { online: false, lastSeen: null } };
      }
    } catch (dbError) {
      console.error('Firebase izin hatası:', dbError);
      // İzin hatası varsa varsayılan değeri döndür
      return { 
        success: true, 
        status: { online: false, lastSeen: null },
        error: 'İzin hatası'
      };
    }
  } catch (error) {
    console.error('Kullanıcı durumu getirme hatası:', error);
    return { 
      success: false, 
      status: { online: false, lastSeen: null },
      error
    };
  }
}

/**
 * Realtime Database - Mesaj gönder
 */
export async function sendMessage(connectionId: string, message: any) {
  console.log('sendMessage başladı:', { connectionId, message });
  try {
    if (!realtime) {
      console.error('Realtime Database başlatılamadı');
      throw new Error('Realtime Database başlatılamadı');
    }
    
    console.log('Firebase referansları oluşturuluyor...');
    const messagesRef = ref(realtime, `/messages/${connectionId}`);
    const newMessageRef = ref(realtime, `/messages/${connectionId}/${Date.now()}`);
    
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };
    
    console.log('Mesaj kaydediliyor:', { path: `/messages/${connectionId}/${Date.now()}`, message: messageWithTimestamp });
    
    try {
      await set(newMessageRef, messageWithTimestamp);
      console.log('Mesaj başarıyla kaydedildi');
      return { success: true };
    } catch (setError) {
      console.error('Firebase set işlemi hatası:', setError);
      return { 
        success: false, 
        error: setError,
        errorDetails: {
          message: (setError as Error).message,
          stack: (setError as Error).stack
        } 
      };
    }
  } catch (error) {
    console.error('Realtime Database mesaj gönderme hatası:', error);
    return { 
      success: false, 
      error,
      errorDetails: {
        message: (error as Error).message,
        stack: (error as Error).stack
      }
    };
  }
} 
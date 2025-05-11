// Firebase yapılandırması
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyB1wsqmrF_4BAG23nizBZRLRHJvOthVbK8",
  authDomain: "lovetree-a2d73.firebaseapp.com",
  projectId: "lovetree-a2d73",
  storageBucket: "lovetree-a2d73.appspot.com",
  messagingSenderId: "858786852371",
  appId: "1:858786852371:web:29ae5ef70eba9e4e4659e6",
  measurementId: "G-L210R5J64Y",
  databaseURL: "https://lovetree-a2d73-default-rtdb.europe-west1.firebasedatabase.app"
};

// Firebase'i başlat
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let realtime: Database | undefined;
let analytics: Analytics | undefined;

// Client tarafında çalıştığından emin ol (NextJS SSR ile ilgili hataları önlemek için)
if (typeof window !== 'undefined') {
  try {
    console.log('Firebase başlatılıyor...');
    console.log('Firebase Config:', { ...firebaseConfig, apiKey: 'GIZLI' });
    
    // Firebase uygulamasını başlat
    if (!getApps().length) {
      console.log('Yeni Firebase uygulaması oluşturuluyor...');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Mevcut Firebase uygulaması kullanılıyor...');
      app = getApp();
    }

    // Firestore başlat
    try {
      console.log('Firestore başlatılıyor...');
      db = getFirestore(app);
      console.log('Firestore başarıyla başlatıldı');
    } catch (firestoreError) {
      console.error('Firestore başlatma hatası:', firestoreError);
    }

    // Realtime Database başlat
    try {
      console.log('Realtime Database başlatılıyor...', firebaseConfig.databaseURL);
      realtime = getDatabase(app);
      console.log('Realtime Database başarıyla başlatıldı');
    } catch (rtdbError) {
      console.error('Realtime Database başlatma hatası:', rtdbError);
    }
    
    // Analytics sadece tarayıcıda ve production ortamında başlat
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('Analytics başlatılıyor...');
        analytics = getAnalytics(app);
        console.log('Analytics başarıyla başlatıldı');
      } catch (analyticsError) {
        console.error('Analytics başlatma hatası:', analyticsError);
      }
    }
    
    console.log('Firebase başarıyla yapılandırıldı');
    console.log('Firebase oluşturulan nesneler:', { 
      app: !!app, 
      db: !!db, 
      realtime: !!realtime, 
      analytics: !!analytics 
    });
  } catch (error) {
    console.error('Firebase yapılandırma hatası:', error);
    console.error('Firebase yapılandırma hata ayrıntıları:', (error as Error).message, (error as Error).stack);
  }
} else {
  console.log('Firebase yalnızca istemci tarafında yükleniyor');
}

export { app, db, realtime, analytics }; 
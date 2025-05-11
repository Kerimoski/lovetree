'use client';

import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaTree, FaComments, FaCalendarCheck, FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Bölümü */}
      <main className="flex flex-col items-center flex-grow">
        {/* Hero Section - Gradient Arka Plan */}
        <div className="w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950 dark:via-teal-950 dark:to-blue-950">
          <div className="max-w-6xl mx-auto py-20 md:py-32 px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-left md:pr-10">
                <div className="inline-block bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-4 py-1 rounded-full text-sm font-medium mb-6 animate-pulse">
                  ✨ İlişkilerde Yeni Bir Deneyim
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">LoveTree</span> ile 
                  <span className="block mt-2">İlişkinizi Güçlendirin</span>
                </h1>
                
                <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-lg">
                  En değerli bağlarınızı güçlendirin. Her etkileşimle büyüyen dijital bir ağaçla ilişkinizi 
                  görselleştirin ve besleyin.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/register" 
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center font-medium text-lg"
                  >
                    Hemen Başla <FaArrowRight className="ml-2" />
                  </Link>
                  <Link 
                    href="/login" 
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center font-medium text-lg"
                  >
                    Giriş Yap
                  </Link>
                </div>
                
                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                  Şimdiden 2,000+ aktif ilişki ağacı büyüyor 🌳
                </div>
              </div>
              
              <div className="flex-1 flex justify-center md:justify-end">
                <div className="relative w-64 h-64 md:w-80 md:h-80 transform transition-all hover:scale-105 duration-500 ease-in-out">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 dark:from-emerald-700/20 dark:to-teal-700/20 rounded-full blur-2xl"></div>
                  <Image 
                    src="/lovetreelogo.png" 
                    alt="LoveTree Logo" 
                    width={320} 
                    height={320}
                    className="object-contain z-10 relative drop-shadow-2xl animate-floating"
                    priority
                    style={{
                      animation: "floating 6s ease-in-out infinite"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Özellikler Bölümü */}
        <div className="w-full bg-white dark:bg-gray-900 py-20">
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-700 dark:text-emerald-500">Özel Anlarınızı Büyütün</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                LoveTree ile sevdiğiniz kişiyle aranızdaki bağı besleyecek birçok özelliği keşfedin.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300">
                <div className="bg-emerald-100 dark:bg-emerald-800/60 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 text-3xl">
                  <FaHeart />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Anılar</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Birlikte yaşadığınız özel anları kaydedin, fotoğraf ekleyin ve zaman içinde 
                  büyüyen bir anı albümü oluşturun.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300">
                <div className="bg-emerald-100 dark:bg-emerald-800/60 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 text-3xl">
                  <FaComments />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Duygu Notları</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Birbirinize özel notlar gönderin, samimi düşüncelerinizi paylaşın ve bu notları puanlayın.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300">
                <div className="bg-emerald-100 dark:bg-emerald-800/60 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 text-3xl">
                  <FaCalendarCheck />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Özel Günler</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Doğum günleri, yıldönümleri ve özel tarihleri takip edin, önemli anları birlikte kutlayın.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nasıl Çalışır Bölümü */}
        <div className="w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950 dark:via-teal-950 dark:to-blue-950 py-20">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-700 dark:text-emerald-500">Nasıl Çalışır?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sadece üç kolay adımda dijital ağacınızı büyütmeye başlayın.
              </p>
            </div>
            
            <div className="flex flex-col space-y-12">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl shadow-lg shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Bağlantı Kodu Oluşturun</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Ücretsiz bir hesap oluşturun ve özel bağlantı kodunuzu alın. Bu kod, sevdiğiniz kişiyle aranızdaki dijital bağın anahtarı olacak.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl shadow-lg shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Kodu Paylaşın</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Bu kodu sadece bağlanmak istediğiniz özel kişiyle paylaşın. Onlar da uygulamaya kaydolup bağlantı kodunuzu girebilir.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl shadow-lg shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Birlikte Büyütün</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Anılar paylaşın, notlar gönderin ve özel günleri işaretleyin. Her etkileşimde ağacınız XP kazanarak büyür ve seviyesi artar.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link 
                href="/register" 
                className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center font-medium text-lg"
              >
                İlişki Ağacınızı Oluşturun <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-emerald-800 to-teal-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-8 h-8 mr-2">
                <Image 
                  src="/lovetreelogo.png" 
                  alt="LoveTree" 
                  width={32} 
                  height={32}
                  className="object-contain" 
                />
              </div>
              <span className="text-2xl font-bold">LoveTree</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/about" className="hover:text-emerald-300 transition-colors">Hakkımızda</Link>
              <Link href="/privacy" className="hover:text-emerald-300 transition-colors">Gizlilik Politikası</Link>
              <Link href="/terms" className="hover:text-emerald-300 transition-colors">Kullanım Şartları</Link>
              <Link href="/contact" className="hover:text-emerald-300 transition-colors">İletişim</Link>
            </div>
          </div>
          <div className="border-t border-emerald-700 pt-8 text-center text-sm text-emerald-300">
            <p>© {new Date().getFullYear()} LoveTree - Tüm Hakları Saklıdır</p>
          </div>
        </div>
      </footer>
      
      {/* Animasyon için gerekli style */}
      <style jsx global>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-floating {
          animation: floating 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

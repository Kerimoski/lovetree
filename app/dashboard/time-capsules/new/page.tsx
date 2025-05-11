'use client';

import { useState, FormEvent, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaArrowLeft, FaUpload, FaTrash, FaLock } from 'react-icons/fa';
import { add, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NewTimeCapsulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrevUrl, setImagePrevUrl] = useState<string | null>(null);
  const [openDate, setOpenDate] = useState<string>('');
  
  // Input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hızlı tarih seçenekleri
  const quickDateOptions = [
    { label: '1 ay sonra', value: add(new Date(), { months: 1 }) },
    { label: '6 ay sonra', value: add(new Date(), { months: 6 }) },
    { label: '1 yıl sonra', value: add(new Date(), { years: 1 }) },
    { label: '5 yıl sonra', value: add(new Date(), { years: 5 }) },
  ];
  
  // Resim seçme işleyicisi
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 1MB'dan büyük dosyaları reddet
    if (file.size > 1 * 1024 * 1024) {
      setError('Dosya boyutu 1MB\'dan küçük olmalıdır');
      return;
    }
    
    // Sadece resim dosyalarını kabul et
    if (!file.type.startsWith('image/')) {
      setError('Lütfen sadece resim dosyası yükleyin');
      return;
    }
    
    setImageFile(file);
    setImagePrevUrl(URL.createObjectURL(file));
    setError(null);
  };
  
  // Resim kaldırma
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePrevUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Hızlı tarih seçimi
  const handleQuickDateSelect = (date: Date) => {
    setOpenDate(date.toISOString().split('T')[0]);
  };
  
  // Form gönderimi
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!activeConnection) {
      setError('Aktif bir bağlantı bulunamadı');
      return;
    }
    
    if (!title.trim() || !description.trim() || !content.trim() || !openDate) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Resmi yükle (varsa)
      let imageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Yerel sunucuya resim yükleme
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.fileUrl; // Yerel API'nin döndürdüğü değişken adı
      }
      
      // Zaman kapsülünü oluştur
      const response = await fetch(`/api/connections/${activeConnection.id}/time-capsules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          content,
          imageUrl,
          openDate: new Date(openDate)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Zaman kapsülü oluşturulamadı');
      }
      
      setSuccessMessage('Zaman kapsülü başarıyla oluşturuldu!');
      
      // Form alanlarını temizle
      setTitle('');
      setDescription('');
      setContent('');
      setImageFile(null);
      setImagePrevUrl(null);
      setOpenDate('');
      
      // 2 saniye sonra liste sayfasına yönlendir
      setTimeout(() => {
        router.push('/dashboard/time-capsules');
      }, 2000);
      
    } catch (err) {
      console.error('Zaman kapsülü oluşturma hatası:', err);
      setError(err instanceof Error ? err.message : 'Zaman kapsülü oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Oturum yok ise login sayfasına yönlendir
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  // Aktif bağlantı yoksa
  if (status === 'authenticated' && !activeConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aktif Bağlantı Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Zaman kapsülü oluşturabilmek için aktif bir bağlantınız olmalı.
          </p>
          <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    );
  }
  
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
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
              <FaLock className="mr-2 text-emerald-600" /> Yeni Zaman Kapsülü Oluştur
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Gelecekte açılması için özel anılarınızı, mesajlarınızı ve fotoğraflarınızı saklayın.
            </p>
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Başlık */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Kapsülünüz için bir başlık girin"
                    required
                  />
                </div>
                
                {/* Açıklama */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Kapsülünüz hakkında kısa bir açıklama yazın"
                    required
                  />
                </div>
                
                {/* İçerik */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    İçerik *
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Kapsülün içeriğini yazın. Bu içerik, kapsül açılıncaya kadar gizli kalacaktır."
                    required
                  />
                </div>
                
                {/* Resim Ekleme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fotoğraf (İsteğe bağlı)
                  </label>
                  
                  {!imagePrevUrl ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                      <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Resim yüklemek için tıklayın veya sürükleyin
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF (max. 5MB)
                      </p>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={imagePrevUrl}
                          alt="Yüklenen resim"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Açılma Tarihi */}
                <div>
                  <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açılma Tarihi *
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="openDate"
                        value={openDate}
                        onChange={(e) => setOpenDate(e.target.value)}
                        min={add(new Date(), { days: 1 }).toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Hızlı Tarih Seçenekleri */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickDateOptions.map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickDateSelect(option.value)}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Oluşturuluyor...
                      </span>
                    ) : (
                      'Zaman Kapsülünü Oluştur'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
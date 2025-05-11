'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaUpload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from '@/app/lib/firebase';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  defaultImage?: string;
  useFirebase?: boolean;
}

export default function ImageUploader({ 
  onImageUploaded, 
  className = '', 
  defaultImage,
  useFirebase = false
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya seçildiğinde
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Önizleme için dosyayı okuyoruz
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Firebase Storage kullanılacaksa
      if (useFirebase && typeof window !== 'undefined' && app) {
        try {
          const storage = getStorage(app);
          const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
          
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          // Yükleme sürecini izle
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => {
              // Hata durumu
              console.error('Firebase yükleme hatası:', error);
              setUploadError('Dosya yüklenemedi');
              setPreviewUrl(null);
              setIsUploading(false);
            }, 
            async () => {
              // Yükleme başarılı
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onImageUploaded(downloadURL);
              setIsUploading(false);
              setUploadProgress(100);
            }
          );
        } catch (error) {
          console.error('Firebase Storage hatası:', error);
          setUploadError('Firebase Storage başlatılamadı, yerel depolamaya geçiliyor');
          // Firebase başarısız olursa yerel depolamaya geç
          await uploadToLocalStorage(file);
        }
        
        return;
      }
      
      // Yerel depolama için API'ye yükleme
      await uploadToLocalStorage(file);
      
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setUploadError(error instanceof Error ? error.message : 'Dosya yüklenemedi');
      setPreviewUrl(null);
    } finally {
      if (!useFirebase) {
        setIsUploading(false);
      }
    }
  };

  // Yerel depolamaya yükleme
  const uploadToLocalStorage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Dosya yükleme hatası');
    }
    
    const data = await response.json();
    // Yüklenen dosya URL'ini üst bileşene gönderiyoruz
    onImageUploaded(data.fileUrl);
  };

  // Dosya seçme alanını tetikle
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={triggerFileInput} 
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          ${isUploading ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50 border-emerald-300'}
          ${uploadError ? 'border-red-300' : ''}
          min-h-[200px] flex flex-col items-center justify-center
        `}
      >
        {previewUrl ? (
          <div className="relative w-full h-40 mb-2">
            <Image 
              src={previewUrl} 
              alt="Önizleme" 
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <FaUpload className="text-4xl text-emerald-400 mb-2" />
        )}
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-emerald-500 mb-2" />
            <span>Yükleniyor... {useFirebase && uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : ''}</span>
            {useFirebase && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {uploadError ? (
              <div className="text-red-500 flex items-center">
                <FaTimes className="mr-1" />
                <span>{uploadError}</span>
              </div>
            ) : (
              <div>
                {previewUrl ? (
                  <div className="text-emerald-600 flex items-center">
                    <FaCheck className="mr-1" />
                    <span>Resim yüklendi. Değiştirmek için tıklayın.</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Resim yüklemek için tıklayın veya sürükleyin</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
} 
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaUpload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

interface DreamImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  defaultImage?: string;
}

export default function DreamImageUploader({ 
  onImageUploaded, 
  className = '', 
  defaultImage
}: DreamImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya seçildiğinde
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (1MB = 1,048,576 bayt)
    if (file.size > 1 * 1024 * 1024) {
      setUploadError('Dosya boyutu 1MB\'tan küçük olmalıdır');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Önizleme için dosyayı okuyoruz
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Dosyayı yükle
      await uploadToLocalStorage(file);
      
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setUploadError(error instanceof Error ? error.message : 'Dosya yüklenemedi');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
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
            <span>Yükleniyor...</span>
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
                  <div className="text-gray-500">
                    <p>Resim yüklemek için tıklayın veya sürükleyin</p>
                    <p className="text-xs mt-1">Maksimum dosya boyutu: 1MB</p>
                  </div>
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
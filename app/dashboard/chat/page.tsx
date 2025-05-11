'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { activeConnection } = useUserContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mesajları getir
  const fetchMessages = async () => {
    if (!activeConnection) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/connections/${activeConnection.id}/chat`);
      
      if (!response.ok) {
        throw new Error('Mesajlar yüklenemedi');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mesaj gönder
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConnection) return;
    
    try {
      setIsSending(true);
      
      const response = await fetch(`/api/connections/${activeConnection.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }
      
      setNewMessage('');
      fetchMessages(); // Mesajları yenile
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Sayfa yüklendiğinde mesajları getir
  useEffect(() => {
    if (status === 'authenticated' && activeConnection) {
      fetchMessages();
      
      // 5 saniyede bir mesajları güncelle
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [status, activeConnection]);
  
  // Yeni mesaj geldiğinde otomatik olarak aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
            Sohbet edebilmek için aktif bir bağlantınız olmalı.
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
            href="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Dashboard'a Dön
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
              Sohbet
            </h1>
            {activeConnection?.pairedWith && (
              <p className="text-gray-600 dark:text-gray-400">
                {activeConnection.pairedWith.name} ile sohbet
              </p>
            )}
          </div>
          
          <div className="flex flex-col h-[600px]">
            {/* Mesaj listesi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">Henüz mesaj yok. Sohbeti başlatın!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user.id === session?.user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          message.user.id === session?.user?.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-start mb-1">
                          {message.user.id !== session?.user?.id && (
                            <div className="mr-2">
                              {message.user.image ? (
                                <Image
                                  src={message.user.image}
                                  alt={message.user.name || 'Kullanıcı'}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                                  {message.user.name?.[0] || '?'}
                                </div>
                              )}
                            </div>
                          )}
                          <div>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {format(new Date(message.createdAt), 'HH:mm - d MMM', { locale: tr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Mesaj gönderme formu */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Bir mesaj yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { FaSpotify, FaPlus, FaMusic } from 'react-icons/fa';

interface SpotifyPlaylistProps {
  connectionId: string;
}

export default function SpotifyPlaylist({ connectionId }: SpotifyPlaylistProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Playlist'leri getir
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotify');
      if (!response.ok) {
        throw new Error('Playlist\'ler getirilemedi');
      }
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yeni playlist oluştur
  const createPlaylist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_playlist',
          connectionId
        })
      });

      if (!response.ok) {
        throw new Error('Playlist oluşturulamadı');
      }

      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [connectionId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaSpotify className="text-green-500" />
          Ortak Müzik Listesi
        </h2>
        <button
          onClick={createPlaylist}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          Yeni Liste
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : playlists.length > 0 ? (
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FaMusic className="text-gray-400" />
                <div>
                  <h3 className="font-medium">{playlist.name}</h3>
                  <p className="text-sm text-gray-500">
                    {playlist.tracks?.total || 0} şarkı
                  </p>
                </div>
              </div>
              <a
                href={playlist.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600"
              >
                Spotify'da Aç
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Henüz ortak bir müzik listeniz yok. Yeni bir liste oluşturmak için yukarıdaki butonu kullanın.
        </div>
      )}
    </div>
  );
} 
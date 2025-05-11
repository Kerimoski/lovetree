import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth/options';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Spotify token alma fonksiyonu
async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// Kullanıcının Spotify hesabını bağlama
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { action, playlistId, trackId } = await req.json();

    switch (action) {
      case 'create_playlist':
        // Ortak playlist oluşturma (şimdilik sahte veri)
        return NextResponse.json({
          playlists: [
            {
              id: 'mock1',
              name: 'Ortak Playlist',
              tracks: { total: 0 },
              external_urls: { spotify: 'https://open.spotify.com/' }
            }
          ]
        });

      case 'add_track':
        // Playlist'e şarkı ekleme
        break;

      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spotify API hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// Kullanıcının Spotify playlist'lerini getirme
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const token = await getSpotifyToken();
    // Playlist'leri getirme işlemleri burada yapılacak

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spotify API hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 
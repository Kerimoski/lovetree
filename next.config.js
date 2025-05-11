/** @type {import('next').NextConfig} */
const nextConfig = {
  // Şu an dosyaları uploads klasöründe lokal olarak saklıyoruz
  outputFileTracingIncludes: {
    '/*': ['./public/uploads/**/*'],
  },
  
  // Yüklenen görsellerin görüntülenmesi için Content Security Policy'yi yapılandırma
  images: {
    unoptimized: true, // Netlify için gerekli
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.app.goo.gl',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
        pathname: '/**',
      }
    ],
  },
  // Netlify için minimum gerekli ayarlar
  output: 'standalone',
};

module.exports = nextConfig;

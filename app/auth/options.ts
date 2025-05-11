import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/app/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  // Oturum sağlayıcıları
  providers: [
    // Google ile giriş
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    
    // Email/Şifre ile giriş
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email ve şifre gereklidir");
        }
        
        try {
          // Kullanıcıyı email ile bul
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user || !user.password) {
            throw new Error("Kullanıcı bulunamadı");
          }
          
          // Şifre kontrolü
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            throw new Error("Hatalı şifre");
          }
          
          // Giriş başarılı
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Yetkilendirme hatası:', error);
          throw new Error('Doğrulama işlemi başarısız oldu');
        }
      },
    }),
  ],
  
  // Oturum bilgisi
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  
  // JWT yapılandırması
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  
  // Sayfalar
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  
  // Cookie ayarları
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  // Geri çağrılar
  callbacks: {
    // JWT oluşturulurken
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    
    // Oturum oluşturulurken
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  // Şifreler ve ayarlar
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Debug modunu aktif et
}; 
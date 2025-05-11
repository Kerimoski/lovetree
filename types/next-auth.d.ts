import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Kullanıcı oturum tipi
   */
  interface Session {
    user: {
      /** Kullanıcı ID'si */
      id: string;
      /** Kullanıcı adı */
      name?: string | null;
      /** Kullanıcı e-postası */
      email?: string | null;
      /** Kullanıcı resmi */
      image?: string | null;
    };
  }
} 
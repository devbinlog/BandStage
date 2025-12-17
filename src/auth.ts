import NextAuth, { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";

// serverEnv를 직접 import - env.ts가 이미 안전하게 처리됨
import { serverEnv } from "@/lib/env";

// Prisma 클라이언트를 동적으로 import하여 데이터베이스 연결 오류 방지
let db: any = null;
let adapter: any = null;

async function getDb() {
  if (!db) {
    try {
      const prismaModule = await import("@/lib/prisma");
      db = prismaModule.db;
    } catch (error) {
      console.error("Failed to import Prisma:", error);
      return null;
    }
  }
  return db;
}

async function getAdapter() {
  const database = await getDb();
  if (!database) {
    return undefined; // adapter 없이 작동 (JWT 전용)
  }
  if (!adapter) {
    adapter = PrismaAdapter(database);
  }
  return adapter;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function getAuthOptions() {
  try {
    const adapterInstance = await getAdapter();
    
    return {
      adapter: adapterInstance,
      session: {
        strategy: "jwt" as const,
      },
      trustHost: true,
      secret: serverEnv.NEXTAUTH_SECRET || "default-secret-key-for-development-only-min-16-chars",
      providers: [
        Credentials({
          name: "Email & Password",
          authorize: async (credentials) => {
            const parsed = credentialsSchema.safeParse(credentials);
            if (!parsed.success) {
              return null;
            }

            const database = await getDb();
            if (!database) {
              return null; // 데이터베이스 없으면 로그인 불가
            }

            try {
              const user = await database.user.findUnique({
                where: { email: parsed.data.email },
              });

              if (!user?.password) {
                return null;
              }

              const isValid = await compare(parsed.data.password, user.password);
              if (!isValid) {
                return null;
              }

              return user;
            } catch (error) {
              console.error("Credentials authorize error:", error);
              return null;
            }
          },
        }),
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            token.role = user.role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
          }
          return session;
        },
      },
    };
  } catch (error) {
    console.error("getAuthOptions error:", error);
    // 에러 발생 시 최소한의 설정으로 반환
    return {
      session: {
        strategy: "jwt" as const,
      },
      trustHost: true,
      secret: "default-secret-key-for-development-only-min-16-chars",
      providers: [],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            token.role = user.role;
          }
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
          }
          return session;
        },
      },
    };
  }
}

let handler: any = null;

async function getHandler() {
  if (!handler) {
    const options = await getAuthOptions();
    handler = NextAuth(options);
  }
  return handler;
}

export default getHandler;

export const auth = async () => {
  try {
    const options = await getAuthOptions();
    return getServerSession(options);
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
};

export const signIn = async (...args: any[]) => {
  try {
    const authHandler = await getHandler();
    return authHandler.signIn(...args);
  } catch (error) {
    console.error("SignIn error:", error);
    throw error;
  }
};

export const signOut = async (...args: any[]) => {
  try {
    const authHandler = await getHandler();
    return authHandler.signOut(...args);
  } catch (error) {
    console.error("SignOut error:", error);
    throw error;
  }
};

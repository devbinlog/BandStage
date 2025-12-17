// 환경 변수를 안전하게 로드 - 에러가 발생해도 앱이 크래시되지 않도록

let serverEnv: any = null;

function safeGetEnv(key: string, defaultValue: string = ""): string {
  try {
    return process.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
}

try {
  // 최소한의 검증만 수행
  serverEnv = {
    DATABASE_URL: safeGetEnv("DATABASE_URL", ""),
    DIRECT_URL: safeGetEnv("DIRECT_URL", ""),
    NEXTAUTH_SECRET: safeGetEnv("NEXTAUTH_SECRET", "default-secret-key-for-development-only-min-16-chars"),
    NEXTAUTH_URL: safeGetEnv("NEXTAUTH_URL", ""),
    AUTH_GOOGLE_ID: safeGetEnv("AUTH_GOOGLE_ID", ""),
    AUTH_GOOGLE_SECRET: safeGetEnv("AUTH_GOOGLE_SECRET", ""),
    SUPABASE_PROJECT_ID: safeGetEnv("SUPABASE_PROJECT_ID", ""),
    SUPABASE_ANON_KEY: safeGetEnv("SUPABASE_ANON_KEY", ""),
  };
} catch (error) {
  console.warn("⚠️ Error loading environment variables:", error);
  // 기본값 사용
  serverEnv = {
    DATABASE_URL: "",
    DIRECT_URL: "",
    NEXTAUTH_SECRET: "default-secret-key-for-development-only-min-16-chars",
    NEXTAUTH_URL: "",
    AUTH_GOOGLE_ID: "",
    AUTH_GOOGLE_SECRET: "",
    SUPABASE_PROJECT_ID: "",
    SUPABASE_ANON_KEY: "",
  };
}

export { serverEnv };

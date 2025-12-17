"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        onClose();
        router.refresh();
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입 중 오류가 발생했습니다.");
      } else {
        // 회원가입 성공 후 자동 로그인
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("회원가입은 완료되었지만 로그인에 실패했습니다.");
        } else {
          onClose();
          router.refresh();
        }
      }
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          aria-label="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid md:grid-cols-2">
          {/* 로그인 섹션 */}
          <div className="border-r border-zinc-800 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-white">로그인</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm text-zinc-400">
                  이메일
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm text-zinc-400">
                  비밀번호
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && isLogin && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "처리 중..." : "로그인"}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-zinc-700"></div>
              <span className="px-4 text-sm text-zinc-500">또는</span>
              <div className="flex-1 border-t border-zinc-700"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Google로 로그인
            </button>
          </div>

          {/* 회원가입 섹션 */}
          <div className="p-8">
            <h2 className="mb-6 text-2xl font-semibold text-white">회원가입</h2>
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="mb-2 block text-sm text-zinc-400">
                  이름
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm text-zinc-400">
                  이메일
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm text-zinc-400">
                  비밀번호 (최소 8자)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && !isLogin && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "처리 중..." : "회원가입"}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-zinc-700"></div>
              <span className="px-4 text-sm text-zinc-500">또는</span>
              <div className="flex-1 border-t border-zinc-700"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Google로 회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


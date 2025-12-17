"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      // 회원가입 성공 후 자동 로그인
      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        // 로그인 실패해도 회원가입은 성공했으므로 로그인 페이지로 이동
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0b1021] sm:text-4xl">회원가입</h1>
          <p className="mt-2 text-sm text-gray-600">
            Band-Stage에 가입하고 공연을 즐겨보세요
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 (최소 8자)
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
                placeholder="비밀번호를 입력하세요"
                minLength={8}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
                placeholder="비밀번호를 다시 입력하세요"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#0d28c4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-medium text-[#0d28c4] hover:text-[#0b1fb5]">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 | Band-Stage",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-200px)] items-center justify-center"><div className="text-gray-400">로딩 중...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

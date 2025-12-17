import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Band-Stage | Band-first Concert Platform",
  description: "밴드가 공연을 만들고 팬이 공연을 찾는 여정을 이어주는 플랫폼",
};

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] xl:grid-cols-[250px_1fr_250px]">
        {/* Left Ad Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 p-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-[200/400] flex items-center justify-center text-xs text-gray-400">
                광고 영역
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 lg:px-12">
          {children}
        </main>

        {/* Right Ad Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 p-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-[200/400] flex items-center justify-center text-xs text-gray-400">
                광고 영역
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}

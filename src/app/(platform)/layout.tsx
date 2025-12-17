import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}

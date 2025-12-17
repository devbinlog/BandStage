"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TicketInfo {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// 임시 목업 데이터
const mockEvent = {
  id: "1",
  slug: "band-stage-launch",
  title: "Band-Stage Launch Showcase",
  startsAt: new Date("2024-12-15T19:30:00"),
  venue: {
    name: "홍대 롤링홀",
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agreeTerms: false,
  });
  const [tickets, setTickets] = useState<TicketInfo[]>([]);

  useEffect(() => {
    const ticketsParam = searchParams.get("tickets");
    if (ticketsParam) {
      try {
        const parsedTickets = JSON.parse(ticketsParam);
        setTickets(parsedTickets);
      } catch (error) {
        console.error("Failed to parse tickets:", error);
      }
    }
  }, [searchParams]);

  const event = mockEvent;
  const totalPrice = tickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0
  );
  const totalQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 결제 처리 로직
    alert("결제 및 예매가 완료되었습니다!");
  };

  if (tickets.length === 0) {
    return (
      <div className="space-y-6 pb-24 sm:space-y-8">
        <header className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl font-bold text-[#0b1021] sm:text-3xl md:text-4xl">
            예매 확인
          </h1>
        </header>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center sm:p-8">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            티켓이 선택되지 않았습니다.
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#0d28c4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 sm:px-8 sm:py-4 sm:text-lg"
          >
            이벤트 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 sm:space-y-8">
      {/* 헤더 */}
      <header className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl font-bold text-[#0b1021] sm:text-3xl md:text-4xl">
          예매 확인
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          구매자 정보를 입력하고 결제를 완료해주세요
        </p>
      </header>

      <div className="space-y-6 sm:space-y-8">
        {/* Event Summary Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[#0b1021] mb-4 sm:text-2xl">
            공연 정보
          </h2>
          <div className="space-y-3 text-sm sm:text-base">
            <div>
              <p className="text-[#0b1021] font-semibold mb-2">{event.title}</p>
              <div className="space-y-1 text-gray-600">
                <p>📅 {formatDate(event.startsAt)}</p>
                <p>🏟 {event.venue.name}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-500 mb-2 sm:text-sm">선택한 티켓</p>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex justify-between items-center text-gray-700"
                >
                  <span className="text-sm sm:text-base">
                    {ticket.name} x{ticket.quantity}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ₩{(ticket.price * ticket.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center text-base font-bold text-[#0b1021] mt-4 pt-4 border-t border-gray-200 sm:text-lg">
                <span>총 결제금액</span>
                <span className="text-[#0d28c4]">
                  ₩{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form - 구매자 정보 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
            <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">
              구매자 정보
            </h2>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이름 <span className="text-red-500">*</span>
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일 <span className="text-red-500">*</span>
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
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeTerms: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-[#0d28c4] focus:ring-[#0d28c4] sm:h-5 sm:w-5"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                <span className="text-red-500">*</span> 결제 및 예매 약관에 동의합니다.
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* CTA 버튼 - 맨 아래 고정 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 sm:text-sm">총 {totalQuantity}장</p>
              <p className="text-base font-bold text-[#0b1021] sm:text-lg">
                ₩{totalPrice.toLocaleString()}
              </p>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                !formData.agreeTerms ||
                !formData.name ||
                !formData.email ||
                !formData.phone
              }
              className="w-full sm:w-auto flex items-center justify-center rounded-lg bg-[#0d28c4] px-8 py-3 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 disabled:opacity-50 disabled:cursor-not-allowed sm:py-4 sm:text-lg"
            >
              결제 및 예매 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

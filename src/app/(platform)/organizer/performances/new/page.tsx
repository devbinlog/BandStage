"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEvent } from "@/server/actions/events";

interface VenueOption {
  id: string;
  name: string;
  city: string | null;
}

interface BandOption {
  id: string;
  name: string;
}

interface TicketTypeInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  perUserLimit: number;
  category: "GENERAL" | "VIP" | "EARLY_BIRD" | "OTHER";
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

export default function NewPerformancePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [bands, setBands] = useState<BandOption[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    { name: "일반", description: "", price: 0, quantity: 100, perUserLimit: 4, category: "GENERAL" },
  ]);

  // 공연장/밴드 목록 로드
  useEffect(() => {
    fetch("/api/venues?limit=50")
      .then((r) => r.json())
      .then((d) => setVenues(d.items ?? []))
      .catch(() => {});

    fetch("/api/bands?limit=50")
      .then((r) => r.json())
      .then((d) => setBands(d.items ?? []))
      .catch(() => {});
  }, []);

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", description: "", price: 0, quantity: 50, perUserLimit: 4, category: "GENERAL" },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = <K extends keyof TicketTypeInput>(
    index: number,
    field: K,
    value: TicketTypeInput[K]
  ) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createEvent({
        title: formData.get("title") as string,
        summary: formData.get("summary") as string,
        description: formData.get("description") as string,
        coverImage: formData.get("coverImage") as string || undefined,
        startsAt: formData.get("startsAt") as string,
        endsAt: (formData.get("endsAt") as string) || null,
        ageLimit: formData.get("ageLimit") as string || undefined,
        venueId: formData.get("venueId") as string || undefined,
        bandId: formData.get("bandId") as string || undefined,
        ticketNote: formData.get("ticketNote") as string || undefined,
        ticketTypes: ticketTypes.filter((tt) => tt.name && tt.quantity > 0),
      });

      if (result.success) {
        router.push(`/organizer`);
      } else {
        alert(result.error ?? "공연 등록에 실패했습니다.");
      }
    } catch {
      alert("공연 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/organizer" className="text-sm text-gray-400 hover:text-[#0d28c4]">
            ← 오거나이저
          </Link>
          <h1 className="text-2xl font-bold text-[#0b1021] mt-1">공연 등록</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            공연 정보를 입력하면 관리자 승인 후 게시됩니다.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <h2 className="font-semibold text-[#0b1021]">기본 정보</h2>

          <div>
            <label htmlFor="title" className={labelClass}>
              공연 제목 <span className="text-red-500">*</span>
            </label>
            <input type="text" id="title" name="title" required className={inputClass} placeholder="공연 제목을 입력하세요" />
          </div>

          <div>
            <label htmlFor="summary" className={labelClass}>
              한 줄 요약 <span className="text-red-500">*</span>
            </label>
            <input type="text" id="summary" name="summary" required className={inputClass} placeholder="공연을 한 문장으로 소개해주세요" />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              공연 소개
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className={inputClass}
              placeholder="공연에 대한 상세 정보를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className={labelClass}>
              포스터 이미지 URL
            </label>
            <input type="url" id="coverImage" name="coverImage" className={inputClass} placeholder="https://example.com/poster.jpg" />
          </div>
        </section>

        {/* 날짜/장소/밴드 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <h2 className="font-semibold text-[#0b1021]">날짜 · 장소 · 밴드</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startsAt" className={labelClass}>
                시작 일시 <span className="text-red-500">*</span>
              </label>
              <input type="datetime-local" id="startsAt" name="startsAt" required className={inputClass} />
            </div>

            <div>
              <label htmlFor="endsAt" className={labelClass}>
                종료 일시
              </label>
              <input type="datetime-local" id="endsAt" name="endsAt" className={inputClass} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="venueId" className={labelClass}>
                공연장
              </label>
              <select id="venueId" name="venueId" className={inputClass}>
                <option value="">공연장 선택</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.city ? `(${v.city})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bandId" className={labelClass}>
                밴드
              </label>
              <select id="bandId" name="bandId" className={inputClass}>
                <option value="">밴드 선택</option>
                {bands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ageLimit" className={labelClass}>
              관람 연령 제한
            </label>
            <input type="text" id="ageLimit" name="ageLimit" className={inputClass} placeholder="예: 만 19세 이상, 전 연령" />
          </div>
        </section>

        {/* 티켓 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0b1021]">티켓 타입</h2>
            <button type="button" onClick={addTicketType} className="text-sm text-[#0d28c4] hover:underline">
              + 추가
            </button>
          </div>

          {ticketTypes.map((ticket, index) => (
            <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0b1021]">티켓 {index + 1}</span>
                {ticketTypes.length > 1 && (
                  <button type="button" onClick={() => removeTicketType(index)} className="text-xs text-red-500 hover:text-red-700">
                    삭제
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, "name", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="일반 / VIP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">카테고리</label>
                  <select
                    value={ticket.category}
                    onChange={(e) => updateTicketType(index, "category", e.target.value as TicketTypeInput["category"])}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0d28c4] focus:outline-none"
                  >
                    <option value="GENERAL">일반</option>
                    <option value="VIP">VIP</option>
                    <option value="EARLY_BIRD">얼리버드</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">가격 (₩)</label>
                  <input
                    type="number"
                    value={ticket.price || ""}
                    onChange={(e) => updateTicketType(index, "price", Number(e.target.value))}
                    min="0"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="0 = 무료"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">수량</label>
                  <input
                    type="number"
                    value={ticket.quantity || ""}
                    onChange={(e) => updateTicketType(index, "quantity", Number(e.target.value))}
                    min="1"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">설명</label>
                  <input
                    type="text"
                    value={ticket.description}
                    onChange={(e) => updateTicketType(index, "description", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="티켓 설명 (선택)"
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <label htmlFor="ticketNote" className={labelClass}>
              티켓 안내사항
            </label>
            <textarea
              id="ticketNote"
              name="ticketNote"
              rows={2}
              className={inputClass}
              placeholder="예: 현장 판매도 가능합니다."
            />
          </div>
        </section>

        {/* 제출 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/organizer"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 text-center"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#0d28c4] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0b1fb5] disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? "등록 중..." : "승인 요청 보내기"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          관리자 승인 후 공개됩니다.
        </p>
      </form>
    </div>
  );
}

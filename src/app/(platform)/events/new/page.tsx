"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/server/actions/events";

interface TicketTypeInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  perUserLimit: number;
}

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    { name: "", description: "", price: 0, quantity: 0, perUserLimit: 4 },
  ]);

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", description: "", price: 0, quantity: 0, perUserLimit: 4 },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index: number, field: keyof TicketTypeInput, value: string | number) => {
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
        coverImage: formData.get("coverImage") as string,
        startsAt: new Date(formData.get("startsAt") as string),
        endsAt: formData.get("endsAt") ? new Date(formData.get("endsAt") as string) : null,
        genre: formData.get("genre") as string,
        ageLimit: formData.get("ageLimit") as string,
        venueId: formData.get("venueId") as string,
        bandId: formData.get("bandId") as string,
        ticketNote: formData.get("ticketNote") as string,
        ticketTypes: ticketTypes.filter(
          (tt) => tt.name && tt.price >= 0 && tt.quantity > 0
        ),
      });

      if (result.success) {
        router.push(`/events/${result.slug}`);
      } else {
        alert(result.error || "공연 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("공연 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:space-y-8">
      <header className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl font-bold text-[#0b1021] sm:text-3xl md:text-4xl">
          공연 등록
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          공연 정보를 입력하고 승인 요청을 보냅니다. 등록 후 수정이 불가능합니다.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* 기본 정보 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">기본 정보</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              공연 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="공연 제목을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              공연 요약 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="summary"
              name="summary"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="짧은 요약을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              공연 소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="공연에 대한 상세한 설명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
              포스터 이미지 URL
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="https://example.com/poster.jpg"
            />
          </div>
        </div>

        {/* 날짜 및 시간 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">날짜 및 시간</h2>

          <div>
            <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-2">
              시작 날짜/시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startsAt"
              name="startsAt"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
            />
          </div>

          <div>
            <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-2">
              종료 날짜/시간 (선택)
            </label>
            <input
              type="datetime-local"
              id="endsAt"
              name="endsAt"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
            />
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">추가 정보</h2>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              장르
            </label>
            <input
              type="text"
              id="genre"
              name="genre"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="예: 인디 록, 재즈, 팝"
            />
          </div>

          <div>
            <label htmlFor="ageLimit" className="block text-sm font-medium text-gray-700 mb-2">
              관람 연령 제한
            </label>
            <input
              type="text"
              id="ageLimit"
              name="ageLimit"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="예: 만 19세 이상, 전 연령"
            />
          </div>

          <div>
            <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 mb-2">
              공연장 (임시: ID 입력)
            </label>
            <input
              type="text"
              id="venueId"
              name="venueId"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="공연장 ID 또는 이름"
            />
            <p className="mt-1 text-xs text-gray-500">
              추후 공연장 선택 UI로 개선 예정
            </p>
          </div>

          <div>
            <label htmlFor="bandId" className="block text-sm font-medium text-gray-700 mb-2">
              밴드 (임시: ID 입력)
            </label>
            <input
              type="text"
              id="bandId"
              name="bandId"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="밴드 ID 또는 이름"
            />
            <p className="mt-1 text-xs text-gray-500">
              추후 밴드 선택 UI로 개선 예정
            </p>
          </div>
        </div>

        {/* 티켓 타입 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">티켓 타입</h2>
            <button
              type="button"
              onClick={addTicketType}
              className="text-sm text-[#0d28c4] hover:text-[#0b1fb5] font-medium"
            >
              + 티켓 타입 추가
            </button>
          </div>

          {ticketTypes.map((ticketType, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#0b1021]">티켓 타입 {index + 1}</h3>
                {ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`ticket-name-${index}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    티켓 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`ticket-name-${index}`}
                    value={ticketType.name}
                    onChange={(e) => updateTicketType(index, "name", e.target.value)}
                    required={index === 0}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="예: 일반, VIP"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`ticket-price-${index}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    가격 (₩) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`ticket-price-${index}`}
                    value={ticketType.price || ""}
                    onChange={(e) => updateTicketType(index, "price", Number(e.target.value))}
                    required={index === 0}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="35000"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`ticket-quantity-${index}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    수량 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id={`ticket-quantity-${index}`}
                    value={ticketType.quantity || ""}
                    onChange={(e) => updateTicketType(index, "quantity", Number(e.target.value))}
                    required={index === 0}
                    min="1"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`ticket-limit-${index}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    1인당 구매 제한
                  </label>
                  <input
                    type="number"
                    id={`ticket-limit-${index}`}
                    value={ticketType.perUserLimit || ""}
                    onChange={(e) =>
                      updateTicketType(index, "perUserLimit", Number(e.target.value))
                    }
                    min="1"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                    placeholder="4"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`ticket-description-${index}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  티켓 설명
                </label>
                <input
                  type="text"
                  id={`ticket-description-${index}`}
                  value={ticketType.description}
                  onChange={(e) => updateTicketType(index, "description", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0b1021] focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
                  placeholder="예: 일반 입장권"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 티켓 노트 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-5 sm:space-y-6">
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">티켓 안내</h2>

          <div>
            <label htmlFor="ticketNote" className="block text-sm font-medium text-gray-700 mb-2">
              티켓 관련 안내사항
            </label>
            <textarea
              id="ticketNote"
              name="ticketNote"
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#0b1021] placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4] text-sm sm:text-base"
              placeholder="예: 현장 판매도 가능합니다."
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-lg bg-[#0d28c4] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
          >
            {isSubmitting ? "등록 중..." : "등록 요청 보내기"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 sm:text-sm">
          관리자 승인 후 공개됩니다. 등록 후 수정이 불가능합니다.
        </p>
      </form>
    </div>
  );
}

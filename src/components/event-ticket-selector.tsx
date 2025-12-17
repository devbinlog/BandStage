"use client";

import { useState } from "react";

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  quantity: number;
  remaining: number;
  perUserLimit?: number;
  category?: string;
}

interface EventTicketSelectorProps {
  ticketTypes: TicketType[];
  eventSlug: string;
  eventStatus: string;
  ticketNote?: string | null;
}

export function EventTicketSelector({
  ticketTypes,
  eventSlug,
  eventStatus,
  ticketNote,
}: EventTicketSelectorProps) {
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(() => {
    const initialQuantities: Record<string, number> = {};
    ticketTypes.forEach((ticketType) => {
      initialQuantities[ticketType.id] = 0;
    });
    return initialQuantities;
  });

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId);
    if (!ticketType) return;

    const currentQty = ticketQuantities[ticketTypeId] || 0;
    const newQty = Math.max(
      0,
      Math.min(
        currentQty + delta,
        ticketType.perUserLimit || 4,
        ticketType.remaining
      )
    );

    setTicketQuantities({
      ...ticketQuantities,
      [ticketTypeId]: newQty,
    });
  };

  const calculateTotal = () => {
    let total = 0;
    ticketTypes.forEach((ticketType) => {
      const qty = ticketQuantities[ticketType.id] || 0;
      total += (Number(ticketType.price) || 0) * qty;
    });
    return total;
  };

  const totalQuantity = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = calculateTotal();

  const handleCheckout = () => {
    if (totalQuantity === 0) {
      alert("티켓을 선택해주세요.");
      return;
    }

    // 선택한 티켓 정보를 쿼리 파라미터로 전달
    const selectedTickets = ticketTypes
      .filter((tt) => (ticketQuantities[tt.id] || 0) > 0)
      .map((tt) => ({
        id: tt.id,
        name: tt.name,
        price: tt.price,
        quantity: ticketQuantities[tt.id],
      }));

    const params = new URLSearchParams();
    params.set("tickets", JSON.stringify(selectedTickets));
    window.location.href = `/events/${eventSlug}/checkout?${params.toString()}`;
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">티켓 예매</h2>
          <p className="text-xs text-gray-500 mt-1 sm:text-sm">
            원하는 티켓을 선택하고 수량을 조절해주세요
          </p>
        </div>

        {ticketTypes && ticketTypes.length > 0 ? (
          <div className="space-y-4">
            {ticketTypes.map((ticketType) => {
              const quantity = ticketQuantities[ticketType.id] || 0;
              const isSoldOut = ticketType.remaining === 0;

              return (
                <div
                  key={ticketType.id}
                  className={`rounded-lg border ${
                    quantity > 0
                      ? "border-[#0d28c4]/50 bg-[#0d28c4]/5"
                      : "border-gray-200 bg-gray-50"
                  } p-3 transition-all sm:p-4`}
                >
                  <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-start sm:justify-between sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[#0b1021] text-sm sm:text-base">
                          {ticketType.name}
                        </h3>
                        {ticketType.category && (
                          <span className="rounded-full border border-[#0d28c4]/30 bg-[#0d28c4]/10 px-2 py-0.5 text-xs text-[#0d28c4]">
                            {ticketType.category}
                          </span>
                        )}
                      </div>
                      {ticketType.description && (
                        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                          {ticketType.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500 break-words">
                        잔여 {ticketType.remaining}장 / 총 {ticketType.quantity}장
                        {ticketType.perUserLimit &&
                          ` · 1인당 최대 ${ticketType.perUserLimit}장`}
                      </p>
                    </div>
                    <div className="text-right sm:ml-4 sm:flex-shrink-0">
                      {ticketType.price ? (
                        <p className="text-base font-bold text-[#0b1021] sm:text-lg">
                          ₩{Number(ticketType.price).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-base font-bold text-[#0b1021] sm:text-lg">무료</p>
                      )}
                      {quantity > 0 && (
                        <p className="text-xs text-[#0d28c4] mt-1 sm:text-sm">
                          ₩{(Number(ticketType.price) * quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isSoldOut ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketType.id, -1)}
                          disabled={quantity === 0}
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-300 bg-white text-[#0b1021] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        >
                          −
                        </button>
                        <span className="text-[#0b1021] font-medium w-6 text-center sm:w-8 text-sm sm:text-base">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ticketType.id, 1)}
                          disabled={
                            quantity >= (ticketType.perUserLimit || 4) ||
                            quantity >= ticketType.remaining
                          }
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-300 bg-white text-[#0b1021] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        >
                          +
                        </button>
                      </div>
                      {quantity > 0 && (
                        <p className="text-xs text-[#0d28c4] font-medium sm:text-sm">
                          {ticketType.price
                            ? `총 ₩${(Number(ticketType.price) * quantity).toLocaleString()}`
                            : "무료"}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-600 sm:text-sm">매진되었습니다</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">티켓 정보가 없습니다.</p>
        )}

        {ticketNote && (
          <div className="pt-3 border-t border-gray-200 sm:pt-4">
            <p className="text-xs text-gray-500 break-words">{ticketNote}</p>
          </div>
        )}
      </div>

      {/* Floating CTA */}
      {totalQuantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 sm:text-sm">선택한 티켓</p>
                <p className="text-base font-bold text-[#0b1021] sm:text-lg break-words">
                  총 {totalQuantity}장 · ₩{totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="flex w-full sm:w-auto items-center justify-center rounded-lg bg-[#0d28c4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 sm:py-4 sm:text-lg"
              >
                예매하기
              </button>
            </div>
          </div>
        </div>
      )}

      {totalQuantity === 0 && eventStatus === "PUBLISHED" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
            <button
              onClick={() => {
                // 첫 번째 티켓을 1개 선택
                if (ticketTypes?.[0] && ticketTypes[0].remaining > 0) {
                  handleQuantityChange(ticketTypes[0].id, 1);
                }
              }}
              className="flex w-full items-center justify-center rounded-lg bg-[#0d28c4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#0d28c4]/30 transition-all hover:bg-[#0b1fb5] hover:shadow-xl hover:shadow-[#0d28c4]/40 sm:py-4 sm:text-lg"
            >
              티켓 선택하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}


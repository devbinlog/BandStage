"use client";

import { useState, useRef } from "react";
import { TicketDesigner } from "@/components/ticket-designer";

export default function TicketDesignPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-gray-500">Ticket Designer</p>
        <h1 className="text-3xl font-semibold text-gray-900">티켓 디자인하기</h1>
        <p className="text-sm text-gray-600">공연 티켓 이미지를 업로드하고 커스터마이징하세요.</p>
      </header>

      <TicketDesigner />
    </div>
  );
}


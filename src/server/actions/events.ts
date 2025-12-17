"use server";

import { revalidatePath } from "next/cache";
import { EventStatus } from "@/generated/prisma/client";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";

interface TicketTypeInput {
  name: string;
  description: string;
  price: number;
  quantity: number;
  perUserLimit: number;
}

interface CreateEventInput {
  title: string;
  summary?: string;
  description?: string;
  coverImage?: string;
  startsAt: Date;
  endsAt?: Date | null;
  genre?: string;
  ageLimit?: string;
  venueId?: string;
  bandId?: string;
  ticketNote?: string;
  ticketTypes: TicketTypeInput[];
}

export async function createEvent(input: CreateEventInput) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 권한 확인 (ARTIST 또는 ADMIN만 등록 가능)
  if (session.user.role !== "ARTIST" && session.user.role !== "ADMIN") {
    return { success: false, error: "공연 등록 권한이 없습니다." };
  }

  try {
    // slug 생성 (제목 기반)
    const baseSlug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 고유한 slug 생성
    let slug = baseSlug;
    let counter = 1;
    while (await db.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 이벤트 생성
    const event = await db.event.create({
      data: {
        title: input.title,
        slug,
        summary: input.summary || null,
        description: input.description || null,
        coverImage: input.coverImage || null,
        startsAt: input.startsAt,
        endsAt: input.endsAt || null,
        genre: input.genre || null,
        ageLimit: input.ageLimit || null,
        ticketNote: input.ticketNote || null,
        status: EventStatus.PENDING, // 승인 대기 상태
        venueId: input.venueId || null,
        bandId: input.bandId || null,
        ownerId: session.user.id,
        ticketTypes: {
          create: input.ticketTypes.map((tt) => ({
            name: tt.name,
            description: tt.description || null,
            price: tt.price,
            currency: "KRW",
            quantity: tt.quantity,
            remaining: tt.quantity,
            perUserLimit: tt.perUserLimit || 4,
          })),
        },
      },
      include: {
        ticketTypes: true,
      },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);

    return { success: true, slug: event.slug, eventId: event.id };
  } catch (error) {
    console.error("createEvent error:", error);
    const errorMessage = error instanceof Error ? error.message : "공연 등록에 실패했습니다.";
    return { success: false, error: errorMessage };
  }
}

// 공연 수정 불가능 확인 함수
export async function canEditEvent(eventId: string) {
  const session = await auth();

  if (!session?.user) {
    return { canEdit: false, reason: "로그인이 필요합니다." };
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { ownerId: true, status: true },
  });

  if (!event) {
    return { canEdit: false, reason: "공연을 찾을 수 없습니다." };
  }

  // 소유자 확인
  if (event.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { canEdit: false, reason: "수정 권한이 없습니다." };
  }

  // PUBLISHED 상태면 수정 불가
  if (event.status === EventStatus.PUBLISHED) {
    return { canEdit: false, reason: "게시된 공연은 수정할 수 없습니다." };
  }

  return { canEdit: true };
}


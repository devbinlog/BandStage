"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils";

const ticketTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().int().positive(),
  perUserLimit: z.number().int().positive().optional(),
  category: z.enum(["GENERAL", "VIP", "EARLY_BIRD", "OTHER"]).optional(),
});

const eventSchema = z.object({
  title: z.string().min(2, "공연 제목은 2자 이상이어야 합니다."),
  summary: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  startsAt: z.string().or(z.date()),
  endsAt: z.string().or(z.date()).optional().nullable(),
  genre: z.string().optional(),
  genreId: z.string().optional(),
  regionId: z.string().optional(),
  ageLimit: z.string().optional(),
  venueId: z.string().optional(),
  bandId: z.string().optional(),
  ticketNote: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  ticketTypes: z.array(ticketTypeSchema).optional(),
});

export async function createEvent(input: z.infer<typeof eventSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  if (session.user.role !== "ARTIST" && session.user.role !== "ADMIN") {
    return { success: false, error: "공연 등록 권한이 없습니다." };
  }

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const slug = await generateUniqueSlug(parsed.data.title, async (s) => {
      const exists = await db.event.findUnique({ where: { slug: s } });
      return !!exists;
    });

    const event = await db.event.create({
      data: {
        title: parsed.data.title,
        slug,
        summary: parsed.data.summary ?? null,
        description: parsed.data.description ?? null,
        coverImage: parsed.data.coverImage ?? null,
        startsAt: new Date(parsed.data.startsAt as string),
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt as string) : null,
        genre: parsed.data.genre ?? null,
        genreId: parsed.data.genreId ?? null,
        regionId: parsed.data.regionId ?? null,
        ageLimit: parsed.data.ageLimit ?? null,
        ticketNote: parsed.data.ticketNote ?? null,
        externalUrl: parsed.data.externalUrl || null,
        status: "PENDING",
        venueId: parsed.data.venueId ?? null,
        bandId: parsed.data.bandId ?? null,
        ownerId: session.user.id,
        ticketTypes: parsed.data.ticketTypes
          ? {
              create: parsed.data.ticketTypes.map((tt) => ({
                name: tt.name,
                description: tt.description ?? null,
                price: tt.price,
                currency: "KRW",
                quantity: tt.quantity,
                remaining: tt.quantity,
                perUserLimit: tt.perUserLimit ?? 4,
                category: tt.category ?? "GENERAL",
              })),
            }
          : undefined,
      },
      include: { ticketTypes: true },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: true, slug: event.slug, eventId: event.id };
  } catch (error) {
    console.error("createEvent error:", error);
    return { success: false, error: "공연 등록에 실패했습니다." };
  }
}

export async function updateEvent(eventId: string, input: z.infer<typeof eventSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "공연을 찾을 수 없습니다." };
  if (event.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "수정 권한이 없습니다." };
  }
  if (event.status === "PUBLISHED" && session.user.role !== "ADMIN") {
    return { success: false, error: "게시된 공연은 수정할 수 없습니다." };
  }

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary ?? null,
        description: parsed.data.description ?? null,
        coverImage: parsed.data.coverImage ?? null,
        startsAt: new Date(parsed.data.startsAt as string),
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt as string) : null,
        genre: parsed.data.genre ?? null,
        genreId: parsed.data.genreId ?? null,
        regionId: parsed.data.regionId ?? null,
        ageLimit: parsed.data.ageLimit ?? null,
        ticketNote: parsed.data.ticketNote ?? null,
        externalUrl: parsed.data.externalUrl || null,
        venueId: parsed.data.venueId ?? null,
        bandId: parsed.data.bandId ?? null,
      },
    });

    revalidatePath(`/events/${updated.slug}`);
    revalidatePath("/organizer/performances");
    return { success: true, slug: updated.slug };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, error: "공연 수정에 실패했습니다." };
  }
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) return { success: false, error: "공연을 찾을 수 없습니다." };
  if (event.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "삭제 권한이 없습니다." };
  }

  try {
    await db.event.delete({ where: { id: eventId } });
    revalidatePath("/events");
    revalidatePath("/organizer/performances");
    return { success: true };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, error: "공연 삭제에 실패했습니다." };
  }
}

// 공연 수정 가능 여부 확인
export async function canEditEvent(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    return { canEdit: false, reason: "로그인이 필요합니다." };
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { ownerId: true, status: true },
  });

  if (!event) return { canEdit: false, reason: "공연을 찾을 수 없습니다." };
  if (event.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { canEdit: false, reason: "수정 권한이 없습니다." };
  }
  if (event.status === "PUBLISHED" && session.user.role !== "ADMIN") {
    return { canEdit: false, reason: "게시된 공연은 수정할 수 없습니다." };
  }

  return { canEdit: true };
}

// 북마크 토글
export async function toggleBookmark(targetType: "EVENT" | "VENUE" | "BAND", targetId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const existing = await db.bookmark.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: session.user.id,
        targetType,
        targetId,
      },
    },
  });

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
    return { success: true, bookmarked: false };
  } else {
    await db.bookmark.create({
      data: { userId: session.user.id, targetType, targetId },
    });
    return { success: true, bookmarked: true };
  }
}

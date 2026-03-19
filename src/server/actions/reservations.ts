"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

export async function createReservation(ticketTypeId: string, quantity: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  if (quantity < 1 || quantity > 10) {
    return { success: false, error: "수량은 1~10장 사이여야 합니다." };
  }

  try {
    const ticketType = await db.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: { event: { select: { id: true, slug: true, status: true } } },
    });

    if (!ticketType) {
      return { success: false, error: "티켓 유형을 찾을 수 없습니다." };
    }

    if (ticketType.event.status !== "PUBLISHED") {
      return { success: false, error: "예매가 불가능한 공연입니다." };
    }

    if (ticketType.remaining < quantity) {
      return { success: false, error: `잔여 수량이 부족합니다. (남은 수량: ${ticketType.remaining})` };
    }

    // 1인 구매 한도 확인
    if (ticketType.perUserLimit) {
      const existing = await db.ticket.aggregate({
        where: {
          ticketTypeId,
          userId: session.user.id,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        _sum: { quantity: true },
      });
      const alreadyBought = existing._sum.quantity ?? 0;
      if (alreadyBought + quantity > ticketType.perUserLimit) {
        return {
          success: false,
          error: `1인 최대 ${ticketType.perUserLimit}장까지 구매 가능합니다.`,
        };
      }
    }

    const totalAmount = ticketType.price
      ? Number(ticketType.price) * quantity
      : 0;

    // 트랜잭션: 티켓 생성 + 잔여 수량 감소
    const ticket = await db.$transaction(async (tx) => {
      const created = await tx.ticket.create({
        data: {
          ticketTypeId,
          eventId: ticketType.eventId,
          userId: session.user!.id,
          quantity,
          totalAmount,
          status: "PENDING",
        },
      });

      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { remaining: { decrement: quantity } },
      });

      return created;
    });

    revalidatePath(`/events/${ticketType.event.slug}`);
    revalidatePath("/mypage/reservations");

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("createReservation error:", error);
    return { success: false, error: "예매에 실패했습니다." };
  }
}

export async function cancelReservation(ticketId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { event: { select: { slug: true, startsAt: true } } },
    });

    if (!ticket) return { success: false, error: "예매 내역을 찾을 수 없습니다." };
    if (ticket.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "취소 권한이 없습니다." };
    }
    if (ticket.status === "CANCELLED") {
      return { success: false, error: "이미 취소된 예매입니다." };
    }

    // 공연 시작 전날까지만 취소 가능
    const cutoff = new Date(ticket.event.startsAt);
    cutoff.setDate(cutoff.getDate() - 1);
    if (new Date() > cutoff) {
      return { success: false, error: "공연 하루 전까지만 취소 가능합니다." };
    }

    await db.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: "CANCELLED" },
      });
      await tx.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: { remaining: { increment: ticket.quantity } },
      });
    });

    revalidatePath("/mypage/reservations");
    return { success: true };
  } catch (error) {
    console.error("cancelReservation error:", error);
    return { success: false, error: "예매 취소에 실패했습니다." };
  }
}

export async function getMyReservations(page = 1, limit = 10) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "로그인이 필요합니다." };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: true,
            startsAt: true,
            venue: { select: { id: true, name: true } },
          },
        },
        ticketType: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.ticket.count({ where: { userId: session.user.id } }),
  ]);

  return { success: true, items, total, page, limit };
}

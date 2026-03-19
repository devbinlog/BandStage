"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return session.user;
}

// 공연 승인
export async function approvePerformance(eventId: string) {
  try {
    const admin = await requireAdmin();
    const event = await db.event.update({
      where: { id: eventId },
      data: { status: "APPROVED" },
    });

    await db.auditLog.create({
      data: {
        action: "APPROVE",
        targetType: "Event",
        targetId: eventId,
        actorId: admin.id,
        after: { status: "APPROVED" },
      },
    });

    revalidatePath("/admin/performances");
    revalidatePath(`/events/${event.slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 공연 반려
export async function rejectPerformance(eventId: string, reason: string) {
  try {
    const admin = await requireAdmin();
    const event = await db.event.update({
      where: { id: eventId },
      data: { status: "REJECTED" },
    });

    await db.auditLog.create({
      data: {
        action: "REJECT",
        targetType: "Event",
        targetId: eventId,
        actorId: admin.id,
        after: { status: "REJECTED", reason },
      },
    });

    revalidatePath("/admin/performances");
    revalidatePath(`/events/${event.slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 공연 게시
export async function publishPerformance(eventId: string) {
  try {
    const admin = await requireAdmin();
    const event = await db.event.update({
      where: { id: eventId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        action: "PUBLISH",
        targetType: "Event",
        targetId: eventId,
        actorId: admin.id,
        after: { status: "PUBLISHED" },
      },
    });

    revalidatePath("/admin/performances");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 공연장 인증
export async function verifyVenue(venueId: string) {
  try {
    const admin = await requireAdmin();
    await db.venue.update({
      where: { id: venueId },
      data: { isVerified: true },
    });

    await db.auditLog.create({
      data: {
        action: "VERIFY",
        targetType: "Venue",
        targetId: venueId,
        actorId: admin.id,
      },
    });

    revalidatePath("/admin/venues");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 사용자 역할 변경
export async function updateUserRole(userId: string, role: string) {
  try {
    await requireAdmin();
    await db.user.update({
      where: { id: userId },
      data: { role: role as "FAN" | "ARTIST" | "VENUE" | "ADMIN" },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 신고 처리
export async function resolveReport(reportId: string, action: "RESOLVED" | "DISMISSED") {
  try {
    const admin = await requireAdmin();
    await db.report.update({
      where: { id: reportId },
      data: {
        status: action,
        reviewerId: admin.id,
        resolvedAt: new Date(),
      },
    });

    revalidatePath("/admin/reports");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 공지사항 생성
export async function createNotice(data: {
  title: string;
  content: string;
  type: "GENERAL" | "MAINTENANCE" | "UPDATE" | "EVENT";
  isPinned?: boolean;
  isPublished?: boolean;
}) {
  try {
    const admin = await requireAdmin();
    await db.notice.create({
      data: {
        ...data,
        authorId: admin.id,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/notices");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 관리자 대시보드 통계
export async function getAdminStats() {
  await requireAdmin();

  const [
    totalUsers,
    totalEvents,
    pendingEvents,
    totalVenues,
    totalTickets,
    openReports,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.event.count({ where: { status: "PENDING" } }),
    db.venue.count(),
    db.ticket.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.report.count({ where: { status: "OPEN" } }),
  ]);

  return {
    totalUsers,
    totalEvents,
    pendingEvents,
    totalVenues,
    totalTickets,
    openReports,
  };
}

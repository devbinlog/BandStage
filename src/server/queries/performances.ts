import { db } from "@/lib/prisma";
import { getPaginationMeta } from "@/lib/utils";
import type { PerformanceFilterParams } from "@/types";

const performanceInclude = {
  genre: { select: { id: true, name: true, color: true } },
  venue: { select: { id: true, name: true, city: true, district: true } },
  band: { select: { id: true, name: true, slug: true } },
  ticketTypes: {
    select: { price: true },
    orderBy: { price: "asc" as const },
    take: 1,
  },
} as const;

export async function getPerformances(params: PerformanceFilterParams = {}) {
  const {
    status,
    genreId,
    regionId,
    venueId,
    bandId,
    q,
    from,
    to,
    page = 1,
    limit = 12,
  } = params;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  } else {
    // 기본: PUBLISHED 상태만 노출
    where.status = "PUBLISHED";
  }

  if (genreId) where.genreId = genreId;
  if (regionId) where.regionId = regionId;
  if (venueId) where.venueId = venueId;
  if (bandId) where.bandId = bandId;

  if (from || to) {
    where.startsAt = {};
    if (from) (where.startsAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startsAt as Record<string, unknown>).lte = new Date(to);
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.event.findMany({
      where,
      include: performanceInclude,
      orderBy: { startsAt: "asc" },
      skip,
      take: limit,
    }),
    db.event.count({ where }),
  ]);

  return {
    items,
    meta: getPaginationMeta(total, page, limit),
  };
}

export async function getPerformanceBySlug(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: {
      genre: true,
      venue: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          region: true,
        },
      },
      band: {
        include: {
          members: { orderBy: { sortOrder: "asc" } },
          genre: true,
        },
      },
      owner: { select: { id: true, name: true, displayName: true } },
      ticketTypes: { orderBy: { price: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      region: true,
    },
  });
}

export async function getUpcomingPerformances(limit = 6) {
  return db.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: { gte: new Date() },
    },
    include: performanceInclude,
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

export async function getPerformancesByOwner(ownerId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.event.findMany({
      where: { ownerId },
      include: {
        ...performanceInclude,
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.event.count({ where: { ownerId } }),
  ]);
  return { items, meta: getPaginationMeta(total, page, limit) };
}

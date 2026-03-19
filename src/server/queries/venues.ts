import { db } from "@/lib/prisma";
import { getPaginationMeta } from "@/lib/utils";
import type { VenueFilterParams } from "@/types";

const venueListInclude = {
  images: {
    select: { url: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
  region: { select: { id: true, name: true } },
} as const;

export async function getVenues(params: VenueFilterParams = {}) {
  const { regionId, venueType, capacityMin, capacityMax, q, page = 1, limit = 12 } = params;

  const where: Record<string, unknown> = {};
  if (regionId) where.regionId = regionId;
  if (venueType) where.venueType = venueType;
  if (capacityMin || capacityMax) {
    where.AND = [];
    if (capacityMin) (where.AND as unknown[]).push({ capacityMax: { gte: capacityMin } });
    if (capacityMax) (where.AND as unknown[]).push({ capacityMin: { lte: capacityMax } });
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { addressLine1: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.venue.findMany({
      where,
      include: venueListInclude,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    db.venue.count({ where }),
  ]);

  return { items, meta: getPaginationMeta(total, page, limit) };
}

export async function getVenueBySlug(slug: string) {
  return db.venue.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      region: true,
      manager: { select: { id: true, name: true, email: true } },
      events: {
        where: {
          status: "PUBLISHED",
          startsAt: { gte: new Date() },
        },
        include: {
          band: { select: { id: true, name: true, slug: true } },
          ticketTypes: {
            select: { price: true },
            orderBy: { price: "asc" as const },
            take: 1,
          },
        },
        orderBy: { startsAt: "asc" },
        take: 5,
      },
      _count: { select: { events: true } },
    },
  });
}

export async function getVenueById(id: string) {
  return db.venue.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      region: true,
      manager: { select: { id: true, name: true } },
    },
  });
}

export async function getVenuesByManager(managerId: string) {
  return db.venue.findMany({
    where: { managerId },
    include: venueListInclude,
    orderBy: { createdAt: "desc" },
  });
}

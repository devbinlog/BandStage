import { db } from "@/lib/prisma";
import { getPaginationMeta } from "@/lib/utils";

export async function getBands(params: {
  genreId?: string;
  regionId?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { genreId, regionId, q, page = 1, limit = 12 } = params;

  const where: Record<string, unknown> = { isActive: true };
  if (genreId) where.genreId = genreId;
  if (regionId) where.regionId = regionId;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      db.band.findMany({
        where,
        include: {
          genre: { select: { id: true, name: true, color: true } },
          region: { select: { id: true, name: true } },
          members: {
            select: { id: true, name: true, role: true },
            orderBy: { sortOrder: "asc" },
            take: 5,
          },
          _count: { select: { events: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.band.count({ where }),
    ]);

    return { items, meta: getPaginationMeta(total, page, limit) };
  } catch {
    return { items: [], meta: getPaginationMeta(0, page, limit) };
  }
}

export async function getBandById(id: string) {
  try {
    return await db.band.findUnique({
      where: { id },
      include: {
        genre: true,
        region: true,
        owner: { select: { id: true, name: true, displayName: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { sortOrder: "asc" },
        },
        events: {
          where: {
            status: "PUBLISHED",
            startsAt: { gte: new Date() },
          },
          include: {
            venue: { select: { id: true, name: true } },
            ticketTypes: {
              select: { price: true },
              orderBy: { price: "asc" as const },
              take: 1,
            },
          },
          orderBy: { startsAt: "asc" },
          take: 5,
        },
        _count: { select: { events: true, members: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getBandsByOwner(ownerId: string) {
  try {
    return await db.band.findMany({
      where: { ownerId },
      include: {
        genre: { select: { id: true, name: true } },
        _count: { select: { members: true, events: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

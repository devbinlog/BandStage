import { db } from "@/lib/prisma";

export async function globalSearch(q: string, limit = 5) {
  if (!q.trim()) {
    return { performances: [], venues: [], bands: [] };
  }

  const searchFilter = { contains: q, mode: "insensitive" as const };

  const [performances, venues, bands] = await Promise.all([
    db.event.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: searchFilter }, { summary: searchFilter }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        startsAt: true,
        coverImage: true,
        genre: { select: { name: true, color: true } },
      },
      orderBy: { startsAt: "asc" },
      take: limit,
    }),
    db.venue.findMany({
      where: {
        OR: [
          { name: searchFilter },
          { description: searchFilter },
          { addressLine1: searchFilter },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        district: true,
        venueType: true,
      },
      take: limit,
    }),
    db.band.findMany({
      where: {
        isActive: true,
        OR: [{ name: searchFilter }, { description: searchFilter }],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        profileImage: true,
        genre: { select: { name: true, color: true } },
      },
      take: limit,
    }),
  ]);

  return { performances, venues, bands };
}

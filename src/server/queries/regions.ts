import { db } from "@/lib/prisma";

export async function getRegions(parentId?: string) {
  try {
    return await db.region.findMany({
      where: parentId ? { parentId } : { parentId: null },
      include: {
        children: {
          include: {
            _count: { select: { venues: true, events: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { venues: true, events: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getRegionBySlug(slug: string) {
  try {
    return await db.region.findUnique({
      where: { slug },
      include: {
        children: {
          include: {
            _count: { select: { venues: true, events: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { venues: true, events: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getAllRegionsFlat() {
  try {
    return await db.region.findMany({
      select: { id: true, name: true, slug: true, level: true, parentId: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    });
  } catch {
    return [];
  }
}

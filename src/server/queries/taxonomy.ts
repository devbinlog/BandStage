import { db } from "@/lib/prisma";

export async function getGenres() {
  try {
    return await db.genre.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    return [];
  }
}

export async function getGenreBySlug(slug: string) {
  try {
    return await db.genre.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

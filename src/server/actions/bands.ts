"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils";

const bandSchema = z.object({
  name: z.string().min(1, "밴드 이름을 입력하세요."),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  profileImage: z.string().optional(),
  formedYear: z.number().int().min(1900).max(2100).optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  soundcloud: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  genreId: z.string().optional(),
  regionId: z.string().optional(),
});

const memberSchema = z.object({
  name: z.string().min(1, "멤버 이름을 입력하세요."),
  role: z.enum(["VOCAL", "GUITAR", "BASS", "DRUMS", "KEYS", "PRODUCER", "MANAGER", "OTHER"]),
  instrument: z.string().optional(),
  userId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function createBand(
  input: z.infer<typeof bandSchema>,
  members: z.infer<typeof memberSchema>[]
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  if (session.user.role !== "ARTIST" && session.user.role !== "ADMIN") {
    return { success: false, error: "밴드 등록 권한이 없습니다." };
  }

  const parsed = bandSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const slug = await generateUniqueSlug(parsed.data.name, async (s) => {
      const exists = await db.band.findUnique({ where: { slug: s } });
      return !!exists;
    });

    const band = await db.band.create({
      data: {
        ...parsed.data,
        slug,
        ownerId: session.user.id,
        website: parsed.data.website || null,
        members: {
          create: members.map((m, idx) => ({
            name: m.name,
            role: m.role,
            instrument: m.instrument,
            userId: m.userId,
            sortOrder: m.sortOrder ?? idx,
          })),
        },
      },
    });

    revalidatePath("/bands");
    return { success: true, bandId: band.id, slug: band.slug };
  } catch (error) {
    console.error("createBand error:", error);
    return { success: false, error: "밴드 등록에 실패했습니다." };
  }
}

export async function updateBand(bandId: string, input: z.infer<typeof bandSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const band = await db.band.findUnique({ where: { id: bandId } });
  if (!band) return { success: false, error: "밴드를 찾을 수 없습니다." };
  if (band.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "수정 권한이 없습니다." };
  }

  const parsed = bandSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    await db.band.update({
      where: { id: bandId },
      data: {
        ...parsed.data,
        website: parsed.data.website || null,
      },
    });

    revalidatePath(`/bands/${bandId}`);
    return { success: true };
  } catch (error) {
    console.error("updateBand error:", error);
    return { success: false, error: "밴드 수정에 실패했습니다." };
  }
}

export async function deleteBand(bandId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const band = await db.band.findUnique({ where: { id: bandId } });
  if (!band) return { success: false, error: "밴드를 찾을 수 없습니다." };
  if (band.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "삭제 권한이 없습니다." };
  }

  try {
    await db.band.delete({ where: { id: bandId } });
    revalidatePath("/bands");
    return { success: true };
  } catch (error) {
    console.error("deleteBand error:", error);
    return { success: false, error: "밴드 삭제에 실패했습니다." };
  }
}

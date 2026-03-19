"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils";

const venueSchema = z.object({
  name: z.string().min(2, "공연장 이름은 2자 이상이어야 합니다."),
  description: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("올바른 이메일을 입력하세요.").optional().or(z.literal("")),
  website: z.string().url("올바른 URL을 입력하세요.").optional().or(z.literal("")),
  naverMapUrl: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  capacityMin: z.number().int().positive().optional(),
  capacityMax: z.number().int().positive().optional(),
  venueType: z.enum(["LIVE_CLUB", "CONCERT_HALL", "OUTDOOR", "MULTIPLEX", "BAR", "OTHER"]).optional(),
  isIndoor: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  bookingPolicy: z.string().optional(),
  notes: z.string().optional(),
  regionId: z.string().optional(),
});

export async function createVenue(input: z.infer<typeof venueSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  if (session.user.role !== "VENUE" && session.user.role !== "ADMIN") {
    return { success: false, error: "공연장 등록 권한이 없습니다." };
  }

  const parsed = venueSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const slug = await generateUniqueSlug(parsed.data.name, async (s) => {
      const exists = await db.venue.findUnique({ where: { slug: s } });
      return !!exists;
    });

    const venue = await db.venue.create({
      data: {
        ...parsed.data,
        slug,
        managerId: session.user.id,
        tags: parsed.data.tags ?? [],
        amenities: parsed.data.amenities ?? [],
        venueType: parsed.data.venueType ?? "OTHER",
        isIndoor: parsed.data.isIndoor ?? true,
        email: parsed.data.email || null,
        website: parsed.data.website || null,
      },
    });

    revalidatePath("/venues");
    return { success: true, slug: venue.slug, venueId: venue.id };
  } catch (error) {
    console.error("createVenue error:", error);
    return { success: false, error: "공연장 등록에 실패했습니다." };
  }
}

export async function updateVenue(venueId: string, input: z.infer<typeof venueSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const venue = await db.venue.findUnique({ where: { id: venueId } });
  if (!venue) return { success: false, error: "공연장을 찾을 수 없습니다." };
  if (venue.managerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "수정 권한이 없습니다." };
  }

  const parsed = venueSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const updated = await db.venue.update({
      where: { id: venueId },
      data: {
        ...parsed.data,
        tags: parsed.data.tags ?? venue.tags,
        amenities: parsed.data.amenities ?? venue.amenities,
        email: parsed.data.email || null,
        website: parsed.data.website || null,
      },
    });

    revalidatePath(`/venues/${updated.slug}`);
    revalidatePath("/venues");
    return { success: true, slug: updated.slug };
  } catch (error) {
    console.error("updateVenue error:", error);
    return { success: false, error: "공연장 수정에 실패했습니다." };
  }
}

export async function deleteVenue(venueId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const venue = await db.venue.findUnique({ where: { id: venueId } });
  if (!venue) return { success: false, error: "공연장을 찾을 수 없습니다." };
  if (venue.managerId !== session.user.id && session.user.role !== "ADMIN") {
    return { success: false, error: "삭제 권한이 없습니다." };
  }

  try {
    await db.venue.delete({ where: { id: venueId } });
    revalidatePath("/venues");
    return { success: true };
  } catch (error) {
    console.error("deleteVenue error:", error);
    return { success: false, error: "공연장 삭제에 실패했습니다." };
  }
}

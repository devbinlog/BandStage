"use server";

import { revalidatePath } from "next/cache";
import { SuggestionStatus } from "@/generated/prisma/client";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import {
  VenueSuggestionInput,
  venueSuggestionSchema,
} from "@/lib/validators/venues";

export async function submitVenueSuggestion(input: VenueSuggestionInput) {
  const session = await auth();
  const parsed = venueSuggestionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("제출 값이 유효하지 않습니다.");
  }

  const suggestion = await db.venueSuggestion.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address?.trim() || null,
      contact: parsed.data.contact?.trim() || null,
      naverMapUrl: parsed.data.naverMapUrl?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      submittedById: session?.user?.id,
    },
  });

  revalidatePath("/venues");
  revalidatePath("/venues/report");

  return suggestion;
}

export async function updateVenueSuggestionStatus({
  id,
  status,
}: {
  id: string;
  status: SuggestionStatus;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("관리자 권한이 필요합니다.");
  }

  const suggestion = await db.venueSuggestion.update({
    where: { id },
    data: {
      status,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/venues");

  return suggestion;
}

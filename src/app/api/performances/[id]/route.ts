import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const event = await db.event.findUnique({
      where: { id },
      include: {
        genre: true,
        venue: true,
        band: { include: { members: { orderBy: { sortOrder: "asc" } } } },
        ticketTypes: { orderBy: { price: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!event) {
      return NextResponse.json({ error: "공연을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ data: event });
  } catch (error) {
    return NextResponse.json({ error: "공연 조회 실패" }, { status: 500 });
  }
}

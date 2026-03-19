import { NextRequest, NextResponse } from "next/server";
import { getPerformances } from "@/server/queries/performances";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  try {
    const result = await getPerformances({
      genreId: searchParams.get("genreId") ?? undefined,
      regionId: searchParams.get("regionId") ?? undefined,
      venueId: searchParams.get("venueId") ?? undefined,
      bandId: searchParams.get("bandId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "12"),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "공연 목록 조회 실패" }, { status: 500 });
  }
}

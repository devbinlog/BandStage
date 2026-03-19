import { NextRequest, NextResponse } from "next/server";
import { getVenues } from "@/server/queries/venues";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  try {
    const result = await getVenues({
      regionId: searchParams.get("regionId") ?? undefined,
      venueType: (searchParams.get("venueType") as "LIVE_CLUB" | "CONCERT_HALL" | "OUTDOOR" | "MULTIPLEX" | "BAR" | "OTHER") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "12"),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "공연장 목록 조회 실패" }, { status: 500 });
  }
}

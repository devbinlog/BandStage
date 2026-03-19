import { NextRequest, NextResponse } from "next/server";
import { getBands } from "@/server/queries/bands";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  try {
    const result = await getBands({
      genreId: searchParams.get("genreId") ?? undefined,
      regionId: searchParams.get("regionId") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "12"),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "밴드 목록 조회 실패" }, { status: 500 });
  }
}

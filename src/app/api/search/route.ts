import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/server/queries/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "5");

  try {
    const results = await globalSearch(q, limit);
    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json({ error: "검색 실패" }, { status: 500 });
  }
}

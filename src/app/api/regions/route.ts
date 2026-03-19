import { NextResponse } from "next/server";
import { getAllRegionsFlat } from "@/server/queries/regions";

export async function GET() {
  try {
    const regions = await getAllRegionsFlat();
    return NextResponse.json({ data: regions });
  } catch (error) {
    return NextResponse.json({ error: "지역 목록 조회 실패" }, { status: 500 });
  }
}

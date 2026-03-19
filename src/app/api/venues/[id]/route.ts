import { NextResponse } from "next/server";
import { getVenueById } from "@/server/queries/venues";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const venue = await getVenueById(id);
    if (!venue) {
      return NextResponse.json({ error: "공연장을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ data: venue });
  } catch (error) {
    return NextResponse.json({ error: "공연장 조회 실패" }, { status: 500 });
  }
}

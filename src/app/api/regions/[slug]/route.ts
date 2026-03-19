import { NextResponse } from "next/server";
import { getRegionBySlug } from "@/server/queries/regions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const region = await getRegionBySlug(slug);
    if (!region) {
      return NextResponse.json({ error: "지역을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ data: region });
  } catch (error) {
    return NextResponse.json({ error: "지역 조회 실패" }, { status: 500 });
  }
}

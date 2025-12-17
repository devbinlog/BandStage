import { NextRequest, NextResponse } from "next/server";
import { getAuthOptions } from "@/auth";
import NextAuth from "next-auth";

async function createHandler() {
  const authOptions = await getAuthOptions();
  return NextAuth(authOptions);
}

export async function GET(req: NextRequest) {
  try {
    const handler = await createHandler();
    return handler(req as any, {} as any);
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const handler = await createHandler();
    return handler(req as any, {} as any);
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}

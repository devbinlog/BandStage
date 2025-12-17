import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 유효하지 않습니다." },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // 이메일 중복 확인
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await hash(password, 10);

    // 사용자 생성
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        displayName: name,
      },
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}


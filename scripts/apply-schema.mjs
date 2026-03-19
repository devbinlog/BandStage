import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client/index.js";

const prisma = new PrismaClient();
const sql = readFileSync("/tmp/schema_clean.sql", "utf-8");

// 세미콜론 기준으로 각 구문 분리 후 실행
const statements = sql
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

async function main() {
  console.log(`📋 SQL 구문 ${statements.length}개 실행 시작...`);
  let ok = 0;
  let skip = 0;
  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt + ";");
      ok++;
    } catch (e) {
      const msg = String(e);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        skip++;
      } else {
        console.error("❌ 실패:", stmt.slice(0, 80), "\n   →", msg.split("\n")[0]);
      }
    }
  }
  console.log(`✅ 완료: ${ok}개 실행, ${skip}개 이미 존재 스킵`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { readFileSync } from "fs";
import { db } from "../src/lib/prisma";

const raw = readFileSync("/tmp/schema_clean.sql", "utf-8");

// 주석 줄 제거 후 전체 SQL 준비
const cleanSql = raw
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n")
  .trim();

async function main() {
  console.log("📋 스키마 SQL 전체 실행 (단일 트랜잭션)...");
  try {
    // 전체를 하나의 트랜잭션으로 실행
    await db.$executeRawUnsafe(
      `DO $$ BEGIN ${cleanSql} END $$;`
    );
    console.log("✅ 완료!");
  } catch (e: unknown) {
    // DO 블록이 안 되면 구문별로 실행
    console.log("DO 블록 실패, 구문별 실행 시도...");
    const statements = cleanSql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 4);

    console.log(`📋 SQL 구문 ${statements.length}개 실행...`);
    let ok = 0, skip = 0, fail = 0;

    for (const stmt of statements) {
      try {
        await db.$executeRawUnsafe(stmt);
        ok++;
        process.stdout.write(".");
      } catch (err: unknown) {
        const msg = String(err);
        if (msg.includes("already exists") || msg.includes("duplicate")) {
          skip++;
          process.stdout.write("s");
        } else {
          fail++;
          console.log(`\n❌ ${stmt.slice(0, 80)} → ${msg.split("\n")[0]}`);
        }
      }
    }
    console.log(`\n✅ 완료: 성공 ${ok}, 스킵 ${skip}, 실패 ${fail}`);
    void e;
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

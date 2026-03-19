/**
 * Band-Stage 시드 스크립트
 * 실행: npx tsx prisma/seed.ts
 *
 * 관리자, 지역, 장르, 샘플 공연장/밴드/공연 데이터를 생성합니다.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { createHash } from "crypto";

// bcryptjs 대신 개발용 단순 해시 (실제 환경에서는 bcryptjs 사용)
async function hashPassword(password: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(password, 10);
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 시작...");

  // ─── 1. 장르 ────────────────────────────────────────────────────────────────
  const genres = await Promise.all(
    [
      { name: "인디 록", slug: "indie-rock", color: "#e11d48", sortOrder: 1 },
      { name: "얼터너티브", slug: "alternative", color: "#7c3aed", sortOrder: 2 },
      { name: "재즈", slug: "jazz", color: "#d97706", sortOrder: 3 },
      { name: "메탈", slug: "metal", color: "#374151", sortOrder: 4 },
      { name: "포크", slug: "folk", color: "#065f46", sortOrder: 5 },
      { name: "블루스", slug: "blues", color: "#1d4ed8", sortOrder: 6 },
      { name: "펑크", slug: "funk", color: "#b45309", sortOrder: 7 },
      { name: "일렉트로닉", slug: "electronic", color: "#0891b2", sortOrder: 8 },
    ].map((g) =>
      prisma.genre.upsert({
        where: { slug: g.slug },
        update: {},
        create: g,
      })
    )
  );
  console.log(`✅ 장르 ${genres.length}개 생성`);

  // ─── 2. 지역 ────────────────────────────────────────────────────────────────
  const korea = await prisma.region.upsert({
    where: { slug: "korea" },
    update: {},
    create: { name: "대한민국", slug: "korea", level: 0, sortOrder: 0 },
  });

  const seoul = await prisma.region.upsert({
    where: { slug: "seoul" },
    update: {},
    create: { name: "서울", slug: "seoul", level: 1, parentId: korea.id, sortOrder: 1 },
  });

  const busan = await prisma.region.upsert({
    where: { slug: "busan" },
    update: {},
    create: { name: "부산", slug: "busan", level: 1, parentId: korea.id, sortOrder: 2 },
  });

  const gyeonggi = await prisma.region.upsert({
    where: { slug: "gyeonggi" },
    update: {},
    create: { name: "경기도", slug: "gyeonggi", level: 1, parentId: korea.id, sortOrder: 3 },
  });

  // 서울 구별
  const seoulDistricts = [
    { name: "마포구 (홍대/합정)", slug: "seoul-mapo" },
    { name: "강남구", slug: "seoul-gangnam" },
    { name: "용산구 (이태원)", slug: "seoul-yongsan" },
    { name: "성동구 (성수)", slug: "seoul-seongdong" },
    { name: "종로구", slug: "seoul-jongno" },
  ];

  const districts = await Promise.all(
    seoulDistricts.map((d, idx) =>
      prisma.region.upsert({
        where: { slug: d.slug },
        update: {},
        create: { name: d.name, slug: d.slug, level: 2, parentId: seoul.id, sortOrder: idx + 1 },
      })
    )
  );

  console.log(`✅ 지역 생성 완료`);

  const mapoRegion = districts[0];

  // ─── 3. 관리자 계정 ────────────────────────────────────────────────────────
  const adminPassword = await hashPassword("admin1234!");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bandstage.kr" },
    update: {},
    create: {
      email: "admin@bandstage.kr",
      name: "관리자",
      displayName: "Band-Stage Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 아티스트 계정
  const artistPassword = await hashPassword("artist1234!");
  const artistUser = await prisma.user.upsert({
    where: { email: "artist@bandstage.kr" },
    update: {},
    create: {
      email: "artist@bandstage.kr",
      name: "테스트 아티스트",
      displayName: "Test Artist",
      password: artistPassword,
      role: "ARTIST",
    },
  });

  // 공연장 매니저 계정
  const venuePassword = await hashPassword("venue1234!");
  const venueUser = await prisma.user.upsert({
    where: { email: "venue@bandstage.kr" },
    update: {},
    create: {
      email: "venue@bandstage.kr",
      name: "공연장 매니저",
      displayName: "Venue Manager",
      password: venuePassword,
      role: "VENUE",
    },
  });

  // 팬 계정
  const fanPassword = await hashPassword("fan12345!");
  await prisma.user.upsert({
    where: { email: "fan@bandstage.kr" },
    update: {},
    create: {
      email: "fan@bandstage.kr",
      name: "테스트 팬",
      displayName: "Test Fan",
      password: fanPassword,
      role: "FAN",
    },
  });

  console.log(`✅ 계정 생성 (admin / artist / venue / fan)`);

  // ─── 4. 공연장 ──────────────────────────────────────────────────────────────
  const venueData = [
    {
      name: "롤링홀",
      slug: "rolling-hall",
      description: "홍대를 대표하는 인디 음악 라이브클럽. 밴드 사운드에 최적화된 음향과 무대로 아티스트와 관객 모두에게 최고의 경험을 제공합니다.",
      addressLine1: "서울 마포구 어울마당로 35",
      district: "홍대",
      city: "서울",
      phone: "02-332-3338",
      naverMapUrl: "https://map.naver.com/p/search/%EB%A1%A4%EB%A7%81%ED%99%80",
      capacityMin: 150,
      capacityMax: 250,
      venueType: "LIVE_CLUB" as const,
      isIndoor: true,
      isVerified: true,
      tags: ["밴드", "록", "인디", "홍대"],
      amenities: ["드럼 풀세트", "기타 앰프", "PA 시스템", "모니터 스피커", "주차 가능"],
      bookingPolicy: "대관료 + 매표 정산 (기본 80:20)\n사운드체크 필수 (공연 2시간 전)\n95dB 이상 소음 경고",
      regionId: mapoRegion.id,
      managerId: venueUser.id,
    },
    {
      name: "CJ Azit",
      slug: "cj-azit",
      description: "공연, 녹음, 촬영까지 가능한 복합 문화 공간. 최신 시설과 전문 스태프가 상주하며 다양한 규모의 행사를 진행합니다.",
      addressLine1: "서울 마포구 합정동 370-4",
      district: "합정",
      city: "서울",
      phone: "02-3143-3000",
      capacityMin: 200,
      capacityMax: 350,
      venueType: "MULTIPLEX" as const,
      isIndoor: true,
      isVerified: true,
      tags: ["복합", "쇼케이스", "녹음실"],
      amenities: ["전문 음향", "촬영 장비 대여", "대기실", "악기 보관"],
      bookingPolicy: "사전 예약 필수. 최소 2주 전 문의.",
      regionId: mapoRegion.id,
      managerId: venueUser.id,
    },
    {
      name: "Club FF",
      slug: "club-ff",
      description: "인디 밴드의 성지로 불리는 홍대 라이브클럽. 20년 전통의 공연 문화를 이어가는 공간입니다.",
      addressLine1: "서울 마포구 홍익로6길 7",
      district: "홍대",
      city: "서울",
      phone: "02-323-7053",
      capacityMin: 100,
      capacityMax: 200,
      venueType: "LIVE_CLUB" as const,
      isIndoor: true,
      isVerified: true,
      tags: ["인디", "록", "언더그라운드"],
      amenities: ["드럼 풀세트", "기타/베이스 앰프", "바"],
      regionId: mapoRegion.id,
      managerId: venueUser.id,
    },
    {
      name: "벨로드롬",
      slug: "velodrome",
      description: "건대입구 인근의 복합 공연 공간. 다양한 장르의 공연과 전시가 열리는 문화 플랫폼입니다.",
      addressLine1: "서울 광진구 아차산로 200",
      district: "건대",
      city: "서울",
      capacityMin: 300,
      capacityMax: 500,
      venueType: "CONCERT_HALL" as const,
      isIndoor: true,
      isVerified: false,
      tags: ["복합공연장", "전시"],
      amenities: ["대형 무대", "전문 조명", "음향 엔지니어"],
      regionId: seoul.id,
      managerId: venueUser.id,
    },
    {
      name: "KT&G 상상마당 홍대",
      slug: "sangsangmadang-hongdae",
      description: "복합 문화 공간으로 공연, 영화, 전시, 디자인 등 다양한 문화 활동이 이루어지는 곳입니다.",
      addressLine1: "서울 마포구 어울마당로 65",
      district: "홍대",
      city: "서울",
      capacityMin: 200,
      capacityMax: 400,
      venueType: "MULTIPLEX" as const,
      isIndoor: true,
      isVerified: true,
      tags: ["복합문화공간", "인디", "아트"],
      amenities: ["카페", "전시실", "영화관", "스튜디오"],
      regionId: mapoRegion.id,
      managerId: venueUser.id,
    },
  ];

  const venues = await Promise.all(
    venueData.map((v) =>
      prisma.venue.upsert({
        where: { slug: v.slug },
        update: {},
        create: {
          ...v,
          tags: v.tags,
          amenities: v.amenities,
        },
      })
    )
  );
  console.log(`✅ 공연장 ${venues.length}개 생성`);

  const indieRock = genres.find((g) => g.slug === "indie-rock")!;
  const alternative = genres.find((g) => g.slug === "alternative")!;
  const jazz = genres.find((g) => g.slug === "jazz")!;

  // ─── 5. 밴드 ────────────────────────────────────────────────────────────────
  const bandData = [
    {
      name: "Parallel Echo",
      slug: "parallel-echo",
      description: "서울 기반 4인조 인디 록 밴드. 몽환적인 기타 리프와 감성적인 가사로 알려져 있으며 2019년 결성 후 꾸준히 홍대 씬에서 활동 중입니다.",
      formedYear: 2019,
      instagram: "https://instagram.com",
      genreId: indieRock.id,
      regionId: mapoRegion.id,
      ownerId: artistUser.id,
      members: [
        { name: "김태양", role: "VOCAL" as const, instrument: "보컬" },
        { name: "이서준", role: "GUITAR" as const, instrument: "기타" },
        { name: "박민준", role: "BASS" as const, instrument: "베이스" },
        { name: "최지현", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    {
      name: "Neon Dive",
      slug: "neon-dive",
      description: "네온 빛 아래 도시의 감성을 담은 얼터너티브 록 밴드. 신스팝과 록을 결합한 독특한 사운드로 주목받고 있습니다.",
      formedYear: 2021,
      youtube: "https://youtube.com",
      genreId: alternative.id,
      regionId: mapoRegion.id,
      ownerId: artistUser.id,
      members: [
        { name: "강하린", role: "VOCAL" as const, instrument: "보컬/키보드" },
        { name: "윤성호", role: "GUITAR" as const, instrument: "기타" },
        { name: "임채원", role: "BASS" as const, instrument: "베이스" },
        { name: "홍준혁", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    {
      name: "Bluestone Quartet",
      slug: "bluestone-quartet",
      description: "정통 재즈와 현대적 감성을 결합한 4인조 재즈 밴드. 컨템포러리 재즈 씬의 신예로 주목받고 있습니다.",
      formedYear: 2020,
      genreId: jazz.id,
      regionId: seoul.id,
      ownerId: artistUser.id,
      members: [
        { name: "박소연", role: "KEYS" as const, instrument: "피아노" },
        { name: "김민성", role: "BASS" as const, instrument: "콘트라베이스" },
        { name: "이도현", role: "DRUMS" as const, instrument: "드럼" },
        { name: "장유진", role: "OTHER" as const, instrument: "색소폰" },
      ],
    },
  ];

  const bands = await Promise.all(
    bandData.map(async (b) => {
      const band = await prisma.band.upsert({
        where: { slug: b.slug },
        update: {},
        create: {
          name: b.name,
          slug: b.slug,
          description: b.description,
          formedYear: b.formedYear,
          instagram: b.instagram,
          youtube: b.youtube,
          genreId: b.genreId,
          regionId: b.regionId,
          ownerId: b.ownerId,
        },
      });

      // 멤버 생성 (기존 삭제 후 재생성)
      await prisma.bandMember.deleteMany({ where: { bandId: band.id } });
      await prisma.bandMember.createMany({
        data: b.members.map((m, idx) => ({
          bandId: band.id,
          name: m.name,
          role: m.role,
          instrument: m.instrument,
          sortOrder: idx,
        })),
      });

      return band;
    })
  );
  console.log(`✅ 밴드 ${bands.length}개 생성`);

  const parallelEcho = bands[0];
  const neonDive = bands[1];
  const bluestoneQuartet = bands[2];
  const rollingHall = venues[0];
  const cjAzit = venues[1];
  const clubFF = venues[2];
  const sangsangmadang = venues[4];

  // ─── 6. 공연 ────────────────────────────────────────────────────────────────
  const now = new Date();
  const futureDate = (daysFromNow: number, hour = 19, minute = 30) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const eventData = [
    {
      title: "Parallel Echo — City Lights Tour",
      slug: "parallel-echo-city-lights-tour",
      summary: "홍대 롤링홀에서 펼치는 Parallel Echo의 신보 발매 기념 공연",
      description: "<p>Parallel Echo의 세 번째 정규 앨범 <em>City Lights</em> 발매를 기념하는 특별한 공연입니다.</p><p>새로운 곡들을 가장 먼저 만나볼 수 있는 자리이니 많은 관심 부탁드립니다.</p>",
      startsAt: futureDate(14),
      endsAt: futureDate(14, 22, 0),
      status: "PUBLISHED" as const,
      genreId: indieRock.id,
      regionId: mapoRegion.id,
      venueId: rollingHall.id,
      bandId: parallelEcho.id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 35000, quantity: 150, remaining: 87 },
        { name: "얼리버드", price: 25000, quantity: 50, remaining: 0 },
      ],
    },
    {
      title: "Neon Dive — Electric Dreams",
      slug: "neon-dive-electric-dreams",
      summary: "CJ Azit에서 선보이는 Neon Dive의 신스팝 록 라이브",
      description: "<p>네온빛 무대 위에서 펼쳐지는 Neon Dive의 특별 공연입니다. 화려한 조명과 함께 신보 수록곡을 선보입니다.</p>",
      startsAt: futureDate(21),
      endsAt: futureDate(21, 22, 30),
      status: "PUBLISHED" as const,
      genreId: alternative.id,
      regionId: mapoRegion.id,
      venueId: cjAzit.id,
      bandId: neonDive.id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 40000, quantity: 200, remaining: 142 },
        { name: "VIP", price: 80000, quantity: 20, remaining: 5 },
      ],
    },
    {
      title: "Bluestone Quartet — Late Night Jazz",
      slug: "bluestone-quartet-late-night-jazz",
      summary: "심야의 재즈 공연. Bluestone Quartet과 함께하는 특별한 밤",
      description: "<p>서울 최고의 재즈 클럽에서 펼쳐지는 Bluestone Quartet의 레이트 나잇 재즈 공연입니다.</p>",
      startsAt: futureDate(7, 21, 0),
      endsAt: futureDate(7, 23, 30),
      status: "PUBLISHED" as const,
      genreId: jazz.id,
      regionId: mapoRegion.id,
      venueId: sangsangmadang.id,
      bandId: bluestoneQuartet.id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반석", price: 30000, quantity: 100, remaining: 63 },
      ],
    },
    {
      title: "Parallel Echo — Acoustic Session",
      slug: "parallel-echo-acoustic-session",
      summary: "어쿠스틱으로 듣는 Parallel Echo의 명곡들",
      description: "<p>전기 기타와 드럼을 내려놓고 어쿠스틱 기타와 피아노로 재해석한 Parallel Echo의 명곡들을 감상하세요.</p>",
      startsAt: futureDate(35),
      endsAt: futureDate(35, 21, 30),
      status: "APPROVED" as const,
      genreId: indieRock.id,
      regionId: mapoRegion.id,
      venueId: clubFF.id,
      bandId: parallelEcho.id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 20000, quantity: 80, remaining: 80 },
      ],
    },
    {
      title: "Indie Band Festival 2026",
      slug: "indie-band-festival-2026",
      summary: "서울 인디 밴드들이 모이는 연례 축제",
      description: "<p>Band-Stage가 주최하는 인디 밴드 페스티벌입니다. 다양한 장르의 밴드들이 함께하는 특별한 하루를 즐기세요.</p>",
      startsAt: futureDate(60, 14, 0),
      endsAt: futureDate(60, 23, 0),
      status: "PENDING" as const,
      genreId: indieRock.id,
      regionId: mapoRegion.id,
      venueId: rollingHall.id,
      bandId: parallelEcho.id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 50000, quantity: 300, remaining: 300 },
        { name: "VIP", price: 100000, quantity: 30, remaining: 30 },
      ],
    },
  ];

  for (const e of eventData) {
    const { ticketTypes, ...eventFields } = e;
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        ...eventFields,
        publishedAt: e.status === "PUBLISHED" ? new Date() : null,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            name: tt.name,
            price: tt.price,
            currency: "KRW",
            quantity: tt.quantity,
            remaining: tt.remaining,
            category: "GENERAL",
            perUserLimit: 4,
          })),
        },
      },
    });
  }
  console.log(`✅ 공연 ${eventData.length}개 생성`);

  console.log("\n🎉 시드 완료!");
  console.log("\n📋 테스트 계정:");
  console.log("  관리자: admin@bandstage.kr / admin1234!");
  console.log("  아티스트: artist@bandstage.kr / artist1234!");
  console.log("  공연장: venue@bandstage.kr / venue1234!");
  console.log("  팬: fan@bandstage.kr / fan12345!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

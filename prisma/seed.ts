/**
 * Band-Stage 시드 스크립트
 * 실행: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";

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
      prisma.genre.upsert({ where: { slug: g.slug }, update: {}, create: g })
    )
  );
  console.log(`✅ 장르 ${genres.length}개`);

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

  const seoulDistricts = [
    { name: "마포구 (홍대/합정)", slug: "seoul-mapo", sortOrder: 1 },
    { name: "강남구", slug: "seoul-gangnam", sortOrder: 2 },
    { name: "용산구 (이태원/한남)", slug: "seoul-yongsan", sortOrder: 3 },
    { name: "성동구 (성수)", slug: "seoul-seongdong", sortOrder: 4 },
    { name: "종로구 (대학로)", slug: "seoul-jongno", sortOrder: 5 },
  ];

  const districts = await Promise.all(
    seoulDistricts.map((d) =>
      prisma.region.upsert({
        where: { slug: d.slug },
        update: {},
        create: { name: d.name, slug: d.slug, level: 2, parentId: seoul.id, sortOrder: d.sortOrder },
      })
    )
  );

  const districtMap: Record<string, typeof districts[0]> = {};
  for (const d of districts) {
    districtMap[d.slug] = d;
  }

  console.log(`✅ 지역 생성 완료`);

  // ─── 3. 계정 ────────────────────────────────────────────────────────────────
  const [adminPw, artistPw, venuePw, fanPw] = await Promise.all([
    hashPassword("admin1234!"),
    hashPassword("artist1234!"),
    hashPassword("venue1234!"),
    hashPassword("fan12345!"),
  ]);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bandstage.kr" },
    update: {},
    create: { email: "admin@bandstage.kr", name: "관리자", displayName: "Band-Stage Admin", password: adminPw, role: "ADMIN" },
  });

  const artistUser = await prisma.user.upsert({
    where: { email: "artist@bandstage.kr" },
    update: {},
    create: { email: "artist@bandstage.kr", name: "테스트 아티스트", displayName: "Test Artist", password: artistPw, role: "ARTIST" },
  });

  const venueUser = await prisma.user.upsert({
    where: { email: "venue@bandstage.kr" },
    update: {},
    create: { email: "venue@bandstage.kr", name: "공연장 매니저", displayName: "Venue Manager", password: venuePw, role: "VENUE" },
  });

  await prisma.user.upsert({
    where: { email: "fan@bandstage.kr" },
    update: {},
    create: { email: "fan@bandstage.kr", name: "테스트 팬", displayName: "Test Fan", password: fanPw, role: "FAN" },
  });

  console.log(`✅ 계정 4개 (admin/artist/venue/fan)`);

  // ─── 4. 공연장 ──────────────────────────────────────────────────────────────
  const venueSeeds = [
    // ── 마포구 (홍대/합정) ──
    {
      slug: "rolling-hall",
      name: "롤링홀",
      description: "1995년부터 운영된 홍대 인디음악의 산실로, 한국 인디씬을 대표하는 뮤지션들이 거쳐간 전설적인 라이브클럽이다. 지하 1~2층 규모로 스탠딩 500명, 좌석 200명을 수용하며 매주 다양한 밴드 공연이 펼쳐진다.",
      addressLine1: "서울특별시 마포구 어울마당로 35 지하1-2층",
      city: "서울", district: "홍대",
      phone: "02-325-6071",
      website: "https://www.rollinghall.co.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EB%A1%A4%EB%A7%81%ED%99%80",
      venueType: "LIVE_CLUB" as const,
      capacityMin: 200, capacityMax: 500,
      isIndoor: true, isVerified: true,
      tags: ["인디", "록", "얼터너티브", "밴드"],
      amenities: ["드럼 풀세트", "기타 앰프", "PA 시스템", "모니터 스피커"],
      regionSlug: "seoul-mapo",
    },
    {
      slug: "club-ff",
      name: "Club FF",
      description: "홍대 인디씬의 대표 라이브클럽으로 목요일부터 일요일까지 밤새 인디밴드 공연이 진행된다. 소규모 공연장이지만 음악적 다양성으로 많은 뮤지션과 팬들에게 사랑받는 공간이다.",
      addressLine1: "서울특별시 마포구 서교동 407-8 지하1층",
      city: "서울", district: "홍대",
      phone: "010-9025-3407",
      website: "https://www.instagram.com/hongdaeff/",
      naverMapUrl: "https://map.naver.com/p/search/Club%20FF%20%ED%99%8D%EB%8C%80",
      venueType: "LIVE_CLUB" as const,
      capacityMin: 100, capacityMax: 200,
      isIndoor: true, isVerified: true,
      tags: ["인디", "얼터너티브", "록", "펑크"],
      amenities: ["드럼 풀세트", "기타/베이스 앰프", "바"],
      regionSlug: "seoul-mapo",
    },
    {
      slug: "dgbd",
      name: "DGBD (드럭)",
      description: "'드럭(Drug)'이라는 애칭으로 불리는 홍대의 전통적인 언더그라운드 라이브클럽으로 서교동에 위치한다. 홍대 인디씬의 뿌리를 간직한 공간으로 신인 밴드부터 베테랑 뮤지션까지 다양한 공연이 열린다.",
      addressLine1: "서울특별시 마포구 잔다리로 23 (서교동)",
      city: "서울", district: "홍대",
      phone: "02-322-3792",
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/DGBD%20%ED%99%8D%EB%8C%80",
      venueType: "LIVE_CLUB" as const,
      capacityMin: 100, capacityMax: 250,
      isIndoor: true, isVerified: true,
      tags: ["인디", "록", "펑크", "언더그라운드"],
      amenities: ["드럼 풀세트", "기타/베이스 앰프"],
      regionSlug: "seoul-mapo",
    },
    {
      slug: "sangsangmadang-hongdae",
      name: "KT&G 상상마당 홍대 라이브홀",
      description: "KT&G가 운영하는 복합문화공간 상상마당의 지하 라이브홀로, 좌석 189석 또는 스탠딩 400명 규모를 자랑한다. 인디, 팝, 록 등 다양한 장르의 공연과 신인 아티스트 쇼케이스가 활발하게 개최된다.",
      addressLine1: "서울특별시 마포구 어울마당로 65 (서교동)",
      city: "서울", district: "홍대",
      phone: "02-330-6200",
      website: "https://www.sangsangmadang.com/main/HD",
      naverMapUrl: "https://map.naver.com/p/search/KT%26G%20%EC%83%81%EC%83%81%EB%A7%88%EB%8B%B9%20%ED%99%8D%EB%8C%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 189, capacityMax: 400,
      isIndoor: true, isVerified: true,
      tags: ["인디", "팝", "록", "다장르"],
      amenities: ["전문 음향", "전문 조명", "대기실", "카페"],
      regionSlug: "seoul-mapo",
    },
    {
      slug: "musinsa-garage",
      name: "무신사 개러지",
      description: "무신사가 운영하는 홍대 최대 규모의 라이브하우스형 공연장으로 스탠딩 550명, 좌석 280석을 수용한다. 동급 공연장 최고 수준의 음향·조명 장비와 대형 LED 스크린을 갖추고 있어 콘서트, 내한공연, 쇼케이스 등이 활발히 진행된다.",
      addressLine1: "서울특별시 마포구 잔다리로 32 (서교동) B1",
      city: "서울", district: "홍대",
      phone: null,
      website: "https://www.musinsagarage.com",
      naverMapUrl: "https://map.naver.com/p/search/%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EA%B0%9C%EB%9F%AC%EC%A7%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 280, capacityMax: 550,
      isIndoor: true, isVerified: true,
      tags: ["인디", "팝", "케이팝", "록"],
      amenities: ["LED 스크린", "전문 음향", "전문 조명", "대기실"],
      regionSlug: "seoul-mapo",
    },

    // ── 강남구 / 송파구 (강남권) ──
    {
      slug: "blue-square",
      name: "블루스퀘어 마스터카드홀",
      description: "용산구 한남동에 위치한 대형 복합 공연장으로 콘서트홀(1,400석/스탠딩 3,000명)과 뮤지컬 전용관(신한카드홀 1,766석)을 갖추고 있다. 한강진역 2번 출구와 직결되며 국내 정상급 아티스트의 단독 콘서트 장소로 손꼽힌다.",
      addressLine1: "서울특별시 용산구 이태원로 294 (한남동)",
      city: "서울", district: "한남동",
      phone: "1544-1591",
      website: "https://www.bluesquare.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EB%B8%94%EB%A3%A8%EC%8A%A4%ED%80%98%EC%96%B4",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 1400, capacityMax: 3000,
      isIndoor: true, isVerified: true,
      tags: ["팝", "록", "케이팝", "대형공연"],
      amenities: ["전문 음향", "전문 조명", "VIP 라운지", "주차"],
      regionSlug: "seoul-gangnam",
    },
    {
      slug: "understage",
      name: "현대카드 UNDERSTAGE",
      description: "현대카드가 운영하는 한남동 소재 프리미엄 라이브공연장으로 최첨단 음향·조명 시스템을 갖추고 있다. 국내외 인디 아티스트부터 팝스타까지 다채로운 공연이 열리며 독보적인 공연 경험을 제공한다.",
      addressLine1: "서울특별시 용산구 이태원로 246 (한남동)",
      city: "서울", district: "한남동",
      phone: "02-331-6301",
      website: "https://dive.hyundaicard.com/web/understage/spaceMain.hdc",
      naverMapUrl: "https://map.naver.com/p/search/%ED%98%84%EB%8C%80%EC%B9%B4%EB%93%9C%20%EC%96%B8%EB%8D%94%EC%8A%A4%ED%85%8C%EC%9D%B4%EC%A7%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 500, capacityMax: 1200,
      isIndoor: true, isVerified: true,
      tags: ["인디", "팝", "록", "얼터너티브", "일렉트로닉"],
      amenities: ["전문 음향", "전문 조명", "바"],
      regionSlug: "seoul-gangnam",
    },
    {
      slug: "olympic-hall",
      name: "올림픽홀",
      description: "올림픽공원 내 위치한 대형 콘서트홀로 고정석 2,452석(스탠딩 700석 추가)을 보유한다. 국내외 유명 아티스트의 대규모 공연이 상시 열리며 서울 동남권을 대표하는 주요 공연장 중 하나다.",
      addressLine1: "서울특별시 송파구 올림픽로 424 올림픽공원 내",
      city: "서울", district: "올림픽공원",
      phone: "02-410-1114",
      website: "https://www.ksponco.or.kr/olympicpark",
      naverMapUrl: "https://map.naver.com/p/search/%EC%98%AC%EB%A6%BC%ED%94%BD%ED%99%80%20%EC%98%AC%EB%A6%BC%ED%94%BD%EA%B3%B5%EC%9B%90",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 700, capacityMax: 2452,
      isIndoor: true, isVerified: true,
      tags: ["팝", "록", "케이팝", "대형공연"],
      amenities: ["전문 음향", "전문 조명", "넓은 주차장"],
      regionSlug: "seoul-gangnam",
    },
    {
      slug: "smtown-theatre",
      name: "SM타운 코엑스아티움 씨어터",
      description: "강남구 삼성동 코엑스 내 SMTOWN@coexartium 5층에 위치한 K-POP 전문 공연장이다. 800석 규모의 극장형 구조로 SM엔터테인먼트 아티스트들의 서라운드 뷰잉 콘서트 등 독특한 포맷의 공연이 진행된다.",
      addressLine1: "서울특별시 강남구 영동대로 513 코엑스아티움 5층",
      city: "서울", district: "삼성동",
      phone: "02-6002-5811",
      website: "https://www.smtownland.com",
      naverMapUrl: "https://map.naver.com/p/search/SMTOWN%20%EC%BD%94%EC%97%91%EC%8A%A4%EC%95%84%ED%8B%B0%EC%9B%80",
      venueType: "MULTIPLEX" as const,
      capacityMin: 400, capacityMax: 800,
      isIndoor: true, isVerified: true,
      tags: ["케이팝", "아이돌", "팝"],
      amenities: ["전문 음향", "전문 조명", "코엑스 쇼핑몰"],
      regionSlug: "seoul-gangnam",
    },
    {
      slug: "pulse-live-hall",
      name: "펄스 라이브홀",
      description: "강남/서초 지역의 소규모 인디밴드 전문 공연장으로 신논현역 1번 출구에서 도보 5분 거리에 위치한다. 직장인 밴드, 대학생 밴드부터 신인 아티스트까지 대관 공연이 활발하게 이루어지는 친근한 라이브홀이다.",
      addressLine1: "서울특별시 서초구 반포동 741 지하1층",
      city: "서울", district: "신논현",
      phone: null,
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/%ED%8E%84%EC%8A%A4%20%EB%9D%BC%EC%9D%B4%EB%B8%8C%ED%99%80",
      venueType: "LIVE_CLUB" as const,
      capacityMin: 70, capacityMax: 100,
      isIndoor: true, isVerified: false,
      tags: ["인디", "록", "밴드"],
      amenities: ["드럼 풀세트", "기타 앰프"],
      regionSlug: "seoul-gangnam",
    },

    // ── 용산구 (이태원/한남) ──
    {
      slug: "all-that-jazz",
      name: "올댓재즈",
      description: "1976년 문을 연 한국 최초의 재즈클럽으로 이태원의 반세기 역사를 간직한 전설적인 공간이다. 매일 저녁 1부·2부 공연이 열리며 국내외 정상급 재즈 연주자들이 무대에 오른다.",
      addressLine1: "서울특별시 용산구 이태원로 216 2층",
      city: "서울", district: "이태원",
      phone: "02-795-5701",
      website: "https://www.instagram.com/allthatjazz_itaewon/",
      naverMapUrl: "https://map.naver.com/p/search/%EC%98%AC%EB%8C%93%EC%9E%AC%EC%A6%88%20%EC%9D%B4%ED%83%9C%EC%9B%90",
      venueType: "BAR" as const,
      capacityMin: 50, capacityMax: 120,
      isIndoor: true, isVerified: true,
      tags: ["재즈", "클래식재즈", "라이브바"],
      amenities: ["바", "음식 메뉴"],
      regionSlug: "seoul-yongsan",
    },
    {
      slug: "boogie-woogie",
      name: "부기우기",
      description: "이태원 경리단길에 위치한 매일 라이브 재즈 공연이 있는 재즈바로 저녁 9시부터 공연이 시작된다. 전문 바텐더의 칵테일과 함께 다양한 재즈 아티스트의 즉흥 연주를 가까이서 감상할 수 있다.",
      addressLine1: "서울특별시 용산구 회나무로 21 2층 (경리단길)",
      city: "서울", district: "경리단길",
      phone: "010-2396-3050",
      website: "https://www.bgwg.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EB%B6%80%EA%B8%B0%EC%9A%B0%EA%B8%B0%20%EC%9D%B4%ED%83%9C%EC%9B%90",
      venueType: "BAR" as const,
      capacityMin: 30, capacityMax: 80,
      isIndoor: true, isVerified: true,
      tags: ["재즈", "블루스", "소울", "라이브바"],
      amenities: ["바", "칵테일"],
      regionSlug: "seoul-yongsan",
    },
    {
      slug: "prismhall",
      name: "프리즘홀 (CJ ENM)",
      description: "상암동 CJ ENM 센터 내 위치한 프리미엄 공연장으로 국내 유수 엔터테인먼트사의 쇼케이스와 단독 콘서트가 주로 열린다. 최첨단 음향·영상 시스템을 보유하고 있으며 체계적인 공연 인프라로 아티스트와 팬 모두에게 최고의 경험을 제공한다.",
      addressLine1: "서울특별시 마포구 상암산로 66 CJ ENM 센터",
      city: "서울", district: "상암",
      phone: "1566-5940",
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/%ED%94%84%EB%A6%AC%EC%A6%98%ED%99%80%20CJ%20ENM",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 500, capacityMax: 2500,
      isIndoor: true, isVerified: true,
      tags: ["케이팝", "팝", "쇼케이스"],
      amenities: ["전문 음향", "전문 조명", "대기실", "주차"],
      regionSlug: "seoul-yongsan",
    },
    {
      slug: "cj-azit",
      name: "CJ Azit",
      description: "공연, 녹음, 촬영까지 가능한 복합 문화 공간. 최신 시설과 전문 스태프가 상주하며 다양한 규모의 행사를 진행합니다.",
      addressLine1: "서울 마포구 합정동 370-4",
      city: "서울", district: "합정",
      phone: "02-3143-3000",
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/CJ%20Azit%20%ED%95%A9%EC%A0%95",
      venueType: "MULTIPLEX" as const,
      capacityMin: 200, capacityMax: 350,
      isIndoor: true, isVerified: true,
      tags: ["복합", "쇼케이스", "녹음실"],
      amenities: ["전문 음향", "촬영 장비 대여", "대기실"],
      regionSlug: "seoul-yongsan",
    },
    {
      slug: "itaewon-live",
      name: "이태원 라이브클럽 FF",
      description: "이태원 중심부에서 다국적 뮤지션과 한국 인디밴드가 함께 무대에 서는 글로벌한 라이브클럽이다. 영어권 관객도 많이 찾는 이태원 특유의 국제적인 분위기를 자랑한다.",
      addressLine1: "서울특별시 용산구 이태원로 130 (이태원동)",
      city: "서울", district: "이태원",
      phone: null,
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/%EC%9D%B4%ED%83%9C%EC%9B%90%20%EB%9D%BC%EC%9D%B4%EB%B8%8C%ED%81%B4%EB%9F%BD",
      venueType: "LIVE_CLUB" as const,
      capacityMin: 80, capacityMax: 180,
      isIndoor: true, isVerified: false,
      tags: ["인디", "록", "얼터너티브"],
      amenities: ["드럼 풀세트", "기타 앰프", "바"],
      regionSlug: "seoul-yongsan",
    },

    // ── 성동구 (성수) ──
    {
      slug: "understand-avenue",
      name: "언더스탠드에비뉴",
      description: "서울숲 진입로에 116개의 컨테이너로 조성된 성수동의 대표 복합문화공간으로 다양한 공연과 행사가 열린다. 인디밴드 공연부터 대형 페스티벌까지 유연하게 활용되는 성수동의 문화 랜드마크다.",
      addressLine1: "서울특별시 성동구 왕십리로 63 (성수동1가)",
      city: "서울", district: "성수",
      phone: "02-725-5526",
      website: "http://www.understandavenue.com",
      naverMapUrl: "https://map.naver.com/p/search/%EC%96%B8%EB%8D%94%EC%8A%A4%ED%83%A0%EB%93%9C%20%EC%97%90%EB%B9%84%EB%89%B4",
      venueType: "MULTIPLEX" as const,
      capacityMin: 200, capacityMax: 1000,
      isIndoor: false, isVerified: true,
      tags: ["인디", "팝", "문화행사", "복합공간", "야외"],
      amenities: ["야외 공연장", "카페", "팝업스토어"],
      regionSlug: "seoul-seongdong",
    },
    {
      slug: "seongsu-art-hall",
      name: "성수아트홀",
      description: "지하철 2호선 뚝섬역 인근에 위치한 352석 규모의 공연장으로 최신 음향·조명 시스템을 갖추고 있다. 성동구 문화재단이 운영하며 클래식, 재즈, 국악 등 다양한 장르의 공연이 연간 활발하게 개최된다.",
      addressLine1: "서울특별시 성동구 뚝섬로1길 43 (성수동1가)",
      city: "서울", district: "성수",
      phone: "02-2204-7570",
      website: "https://www.sdfac.or.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EC%84%B1%EC%88%98%EC%95%84%ED%8A%B8%ED%99%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 200, capacityMax: 352,
      isIndoor: true, isVerified: true,
      tags: ["클래식", "재즈", "팝", "다장르"],
      amenities: ["전문 음향", "전문 조명", "좌석 352석"],
      regionSlug: "seoul-seongdong",
    },
    {
      slug: "s-factory",
      name: "에스팩토리",
      description: "성수동 공장지대를 도시재생으로 탈바꿈한 복합문화공간으로 A·B·C·D동 4개 건물과 루프탑으로 구성된다. 명품 팝업스토어부터 대규모 콘서트까지 장르를 가리지 않는 이벤트가 공존하는 성수동의 랜드마크다.",
      addressLine1: "서울특별시 성동구 연무장15길 11 (성수동2가)",
      city: "서울", district: "성수",
      phone: "02-6388-8321",
      website: "https://www.sfactory.co.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EC%97%90%EC%8A%A4%ED%8C%A9%ED%86%A0%EB%A6%AC%20%EC%84%B1%EC%88%98",
      venueType: "MULTIPLEX" as const,
      capacityMin: 300, capacityMax: 2000,
      isIndoor: true, isVerified: true,
      tags: ["인디", "팝", "일렉트로닉", "복합공간"],
      amenities: ["대형 무대", "루프탑", "복합 공간"],
      regionSlug: "seoul-seongdong",
    },
    {
      slug: "entry55-seongsu",
      name: "엔트리55 성수",
      description: "2024년 성수동에 오픈한 재즈 라이브 라운지로 '재즈의 입구(The Entry to Jazz)'를 표방한다. 주류와 함께 프로 재즈 뮤지션의 공연을 즐길 수 있으며 기업행사, 팬미팅 등 다양한 대관이 가능하다.",
      addressLine1: "서울특별시 성동구 성수일로8길 60 지하1층",
      city: "서울", district: "성수",
      phone: "0507-1441-4955",
      website: "https://www.instagram.com/entry55_official/",
      naverMapUrl: "https://map.naver.com/p/search/%EC%97%94%ED%8A%B8%EB%A6%AC55%20%EC%84%B1%EC%88%98",
      venueType: "BAR" as const,
      capacityMin: 80, capacityMax: 150,
      isIndoor: true, isVerified: true,
      tags: ["재즈", "소울", "팝", "라이브바"],
      amenities: ["바", "프리미엄 음향"],
      regionSlug: "seoul-seongdong",
    },
    {
      slug: "velodrome",
      name: "벨로드롬",
      description: "건대입구 인근의 복합 공연 공간. 다양한 장르의 공연과 전시가 열리는 문화 플랫폼이다.",
      addressLine1: "서울 광진구 아차산로 200",
      city: "서울", district: "건대",
      phone: null,
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/%EB%B2%A8%EB%A1%9C%EB%93%9C%EB%A1%AC%20%EA%B1%B4%EB%8C%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 300, capacityMax: 500,
      isIndoor: true, isVerified: false,
      tags: ["복합공연장", "전시", "다장르"],
      amenities: ["대형 무대", "전문 조명"],
      regionSlug: "seoul-seongdong",
    },

    // ── 종로구 (대학로) ──
    {
      slug: "sejong-center",
      name: "세종문화회관 대극장",
      description: "1978년 개관한 한국을 대표하는 국가급 종합 공연장으로 대극장(3,022석), 세종M씨어터(609석), 세종S씨어터(300석), 세종체임버홀(443석) 등을 보유한다. 광화문 광장에 위치하여 연중 수준 높은 클래식·뮤지컬·국악 공연이 개최된다.",
      addressLine1: "서울특별시 종로구 세종대로 175 (세종로)",
      city: "서울", district: "광화문",
      phone: "02-399-1000",
      website: "https://www.sejongpac.or.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EC%84%B8%EC%A2%85%EB%AC%B8%ED%99%94%ED%9A%8C%EA%B4%80",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 1000, capacityMax: 3022,
      isIndoor: true, isVerified: true,
      tags: ["클래식", "오페라", "뮤지컬", "국악"],
      amenities: ["전문 음향", "전문 조명", "VIP 라운지", "주차"],
      regionSlug: "seoul-jongno",
    },
    {
      slug: "nakwon-stage",
      name: "낙원악기상가 공연장",
      description: "악기 전문 복합상가로 유명한 낙원악기상가 4층에는 소규모 공연장이 조성되어 있어 아마추어 뮤지션부터 프로까지 다양한 공연이 열린다. 50년 이상의 역사를 간직한 음악인들의 성지다.",
      addressLine1: "서울특별시 종로구 삼일대로 428 (낙원동) 4층",
      city: "서울", district: "종로",
      phone: null,
      website: null,
      naverMapUrl: "https://map.naver.com/p/search/%EB%82%99%EC%9B%90%EC%95%85%EA%B8%B0%EC%83%81%EA%B0%80",
      venueType: "MULTIPLEX" as const,
      capacityMin: 50, capacityMax: 150,
      isIndoor: true, isVerified: false,
      tags: ["재즈", "클래식", "어쿠스틱", "인디"],
      amenities: ["악기 대여", "연습실"],
      regionSlug: "seoul-jongno",
    },
    {
      slug: "chunnyundando",
      name: "천년동안도 낙원점",
      description: "1996년 문을 연 종로 낙원동의 전설적인 재즈 라이브 카페로 매일 저녁 라이브 공연이 2부에 걸쳐 진행된다. TV 예능 '놀면 뭐하니?'에 소개되어 유명해졌으며 서울 3대 재즈바 중 하나로 손꼽힌다.",
      addressLine1: "서울특별시 종로구 수표로 134 2층",
      city: "서울", district: "종로",
      phone: "02-743-5555",
      website: "http://www.chunnyun.com",
      naverMapUrl: "https://map.naver.com/p/search/%EC%B2%9C%EB%85%84%EB%8F%99%EC%95%88%EB%8F%84%20%EB%82%99%EC%9B%90",
      venueType: "BAR" as const,
      capacityMin: 60, capacityMax: 100,
      isIndoor: true, isVerified: true,
      tags: ["재즈", "소울", "라이브바"],
      amenities: ["바", "음식 메뉴"],
      regionSlug: "seoul-jongno",
    },
    {
      slug: "jtn-art-hall",
      name: "JTN 아트홀",
      description: "종로구 혜화동 대학로 인근에 위치한 복합 공연예술 공간이다. 연극, 음악, 무용 등 다양한 장르의 공연이 이루어지며 신인 아티스트들의 데뷔 무대로 활발하게 활용된다.",
      addressLine1: "서울특별시 종로구 이화장길 26 (혜화동)",
      city: "서울", district: "대학로",
      phone: null,
      website: "http://jtnarthall.com",
      naverMapUrl: "https://map.naver.com/p/search/JTN%20%EC%95%84%ED%8A%B8%ED%99%80%20%EC%A2%85%EB%A1%9C",
      venueType: "CONCERT_HALL" as const,
      capacityMin: 100, capacityMax: 300,
      isIndoor: true, isVerified: false,
      tags: ["인디", "클래식", "재즈", "다장르"],
      amenities: ["전문 음향", "전문 조명"],
      regionSlug: "seoul-jongno",
    },
    {
      slug: "marronnier-stage",
      name: "마로니에 야외공연장",
      description: "대학로 문화예술의 중심인 마로니에공원 내 야외공연장으로 누구나 대관하여 공연할 수 있는 열린 문화공간이다. 매일 버스킹과 기획 공연이 펼쳐지며 대학로 특유의 활기찬 예술 분위기를 만끽할 수 있다.",
      addressLine1: "서울특별시 종로구 대학로 104 마로니에공원 내",
      city: "서울", district: "대학로",
      phone: "02-3670-7400",
      website: "https://www.jfac.or.kr",
      naverMapUrl: "https://map.naver.com/p/search/%EB%A7%88%EB%A1%9C%EB%8B%88%EC%97%90%20%EA%B3%B5%EC%9B%90%20%EC%A2%85%EB%A1%9C",
      venueType: "OUTDOOR" as const,
      capacityMin: 200, capacityMax: 2000,
      isIndoor: false, isVerified: true,
      tags: ["인디", "팝", "버스킹", "야외"],
      amenities: ["야외 무대", "잔디광장"],
      regionSlug: "seoul-jongno",
    },
  ];

  const venueMap: Record<string, Awaited<ReturnType<typeof prisma.venue.upsert>>> = {};
  for (const v of venueSeeds) {
    const { regionSlug, tags, amenities, ...venueFields } = v;
    const regionId = districtMap[regionSlug]?.id ?? seoul.id;
    const venue = await prisma.venue.upsert({
      where: { slug: venueFields.slug },
      update: {},
      create: { ...venueFields, regionId, managerId: venueUser.id, tags, amenities },
    });
    venueMap[venueFields.slug] = venue;
  }
  console.log(`✅ 공연장 ${venueSeeds.length}개`);

  // ─── 5. 밴드 ────────────────────────────────────────────────────────────────
  const indieRock = genres.find((g) => g.slug === "indie-rock")!;
  const alternative = genres.find((g) => g.slug === "alternative")!;
  const jazz = genres.find((g) => g.slug === "jazz")!;
  const metal = genres.find((g) => g.slug === "metal")!;
  const folk = genres.find((g) => g.slug === "folk")!;
  const blues = genres.find((g) => g.slug === "blues")!;
  const funk = genres.find((g) => g.slug === "funk")!;
  const electronic = genres.find((g) => g.slug === "electronic")!;

  const bandData = [
    // ── 인디 록 ──
    {
      name: "Parallel Echo",
      slug: "parallel-echo",
      description: "서울 기반 4인조 인디 록 밴드. 몽환적인 기타 리프와 감성적인 가사로 알려져 있으며 2019년 결성 후 꾸준히 홍대 씬에서 활동 중입니다. 세 장의 정규 앨범과 두 장의 EP를 발매했습니다.",
      formedYear: 2019,
      instagram: "https://instagram.com",
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      ownerId: artistUser.id,
      members: [
        { name: "김태양", role: "VOCAL" as const, instrument: "보컬" },
        { name: "이서준", role: "GUITAR" as const, instrument: "기타" },
        { name: "박민준", role: "BASS" as const, instrument: "베이스" },
        { name: "최지현", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    // ── 얼터너티브 ──
    {
      name: "Neon Dive",
      slug: "neon-dive",
      description: "네온 빛 아래 도시의 감성을 담은 얼터너티브 록 밴드. 신스팝과 록을 결합한 독특한 사운드로 주목받고 있습니다. 2021년 데뷔 이후 각종 인디 페스티벌의 헤드라이너로 빠르게 성장했습니다.",
      formedYear: 2021,
      youtube: "https://youtube.com",
      genreId: alternative.id,
      regionId: districtMap["seoul-mapo"].id,
      ownerId: artistUser.id,
      members: [
        { name: "강하린", role: "VOCAL" as const, instrument: "보컬/키보드" },
        { name: "윤성호", role: "GUITAR" as const, instrument: "기타" },
        { name: "임채원", role: "BASS" as const, instrument: "베이스" },
        { name: "홍준혁", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    // ── 재즈 ──
    {
      name: "Bluestone Quartet",
      slug: "bluestone-quartet",
      description: "정통 재즈와 현대적 감성을 결합한 4인조 재즈 밴드. 컨템포러리 재즈 씬의 신예로 주목받고 있으며, 국내 주요 재즈 페스티벌에 연이어 초청받고 있습니다.",
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
    // ── 메탈 ──
    {
      name: "Iron Sermon",
      slug: "iron-sermon",
      description: "2017년 결성된 5인조 헤비메탈 밴드. 강렬한 리프와 더블 기타 편성으로 한국 메탈 씬에서 독보적인 존재감을 발휘합니다. 국내 최대 메탈 페스티벌 헤드라이너 출연 경력을 보유하고 있습니다.",
      formedYear: 2017,
      instagram: "https://instagram.com",
      genreId: metal.id,
      regionId: districtMap["seoul-mapo"].id,
      ownerId: artistUser.id,
      members: [
        { name: "전재혁", role: "VOCAL" as const, instrument: "보컬" },
        { name: "김준수", role: "GUITAR" as const, instrument: "기타" },
        { name: "오현진", role: "GUITAR" as const, instrument: "기타" },
        { name: "황민우", role: "BASS" as const, instrument: "베이스" },
        { name: "안성호", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    // ── 포크 ──
    {
      name: "Willow & Reed",
      slug: "willow-and-reed",
      description: "통기타와 플루트가 어우러지는 감성 포크 듀오. 일상의 이야기를 담은 서정적인 가사와 따뜻한 하모니로 많은 사랑을 받고 있습니다. 2022년 발매한 데뷔 앨범이 각종 음악 차트 포크 부문 1위를 기록했습니다.",
      formedYear: 2022,
      instagram: "https://instagram.com",
      genreId: folk.id,
      regionId: districtMap["seoul-jongno"].id,
      ownerId: artistUser.id,
      members: [
        { name: "서유진", role: "VOCAL" as const, instrument: "보컬/어쿠스틱 기타" },
        { name: "노하영", role: "OTHER" as const, instrument: "플루트/보컬" },
      ],
    },
    // ── 블루스 ──
    {
      name: "Seoul Blues Band",
      slug: "seoul-blues-band",
      description: "미국 남부 블루스의 정수를 한국적 감성으로 재해석하는 5인조 블루스 밴드. 리더 기타리스트의 강렬한 슬라이드 기타와 빈티지 하몬드 오르간 사운드가 트레이드마크입니다.",
      formedYear: 2015,
      genreId: blues.id,
      regionId: districtMap["seoul-yongsan"].id,
      ownerId: artistUser.id,
      members: [
        { name: "박찬영", role: "VOCAL" as const, instrument: "보컬/슬라이드 기타" },
        { name: "최우석", role: "GUITAR" as const, instrument: "기타" },
        { name: "정다운", role: "KEYS" as const, instrument: "하몬드 오르간" },
        { name: "신현탁", role: "BASS" as const, instrument: "베이스" },
        { name: "권지훈", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    // ── 펑크 ──
    {
      name: "Groove Factory",
      slug: "groove-factory",
      description: "훵크(Funk)와 소울을 기반으로 한 7인조 대형 밴드. 브라스 섹션과 탄탄한 리듬 섹션이 만들어내는 그루브는 모든 공연장을 댄스 플로어로 만드는 마법을 부립니다.",
      formedYear: 2018,
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      genreId: funk.id,
      regionId: districtMap["seoul-mapo"].id,
      ownerId: artistUser.id,
      members: [
        { name: "이정원", role: "VOCAL" as const, instrument: "보컬" },
        { name: "배수진", role: "GUITAR" as const, instrument: "기타" },
        { name: "문태현", role: "BASS" as const, instrument: "베이스" },
        { name: "강민철", role: "DRUMS" as const, instrument: "드럼" },
        { name: "윤보라", role: "KEYS" as const, instrument: "키보드" },
        { name: "조성민", role: "OTHER" as const, instrument: "트럼펫" },
        { name: "한지수", role: "OTHER" as const, instrument: "색소폰" },
      ],
    },
    // ── 일렉트로닉 ──
    {
      name: "CTRL+ALT",
      slug: "ctrl-alt",
      description: "테크노와 인디 록을 융합한 전자음악 프로젝트. 라이브 드럼과 신서사이저, 실시간 루프 스테이션을 활용한 퍼포먼스가 특징이며 시각 아트와 결합된 이머시브(immersive) 공연으로 주목받고 있습니다.",
      formedYear: 2023,
      instagram: "https://instagram.com",
      genreId: electronic.id,
      regionId: districtMap["seoul-seongdong"].id,
      ownerId: artistUser.id,
      members: [
        { name: "이현수", role: "VOCAL" as const, instrument: "보컬/신서사이저" },
        { name: "최예진", role: "DRUMS" as const, instrument: "드럼/퍼커션" },
      ],
    },
    // ── 인디 록 (추가) ──
    {
      name: "Static Bloom",
      slug: "static-bloom",
      description: "홍대에서 활동하는 3인조 슈게이징 밴드. 겹겹이 쌓이는 기타 이펙트와 몽환적인 보컬 레이어로 독자적인 분위기를 구축했습니다. 음악 매체로부터 '한국 슈게이징의 미래'라는 평을 받고 있습니다.",
      formedYear: 2020,
      instagram: "https://instagram.com",
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      ownerId: artistUser.id,
      members: [
        { name: "정은수", role: "VOCAL" as const, instrument: "보컬/기타" },
        { name: "류승민", role: "BASS" as const, instrument: "베이스/키보드" },
        { name: "허다빈", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
    // ── 얼터너티브 (추가) ──
    {
      name: "Late Summer",
      slug: "late-summer",
      description: "계절의 끝에서 느끼는 감정을 음악으로 담아내는 4인조 드림팝 밴드. 따뜻하면서도 쓸쓸한 특유의 감성이 많은 팬들의 공감을 이끌어냅니다. 첫 EP 'Afterglow'가 발매 직후 각종 플레이리스트에 대거 수록되었습니다.",
      formedYear: 2021,
      instagram: "https://instagram.com",
      genreId: alternative.id,
      regionId: districtMap["seoul-seongdong"].id,
      ownerId: artistUser.id,
      members: [
        { name: "남지안", role: "VOCAL" as const, instrument: "보컬/기타" },
        { name: "한승원", role: "GUITAR" as const, instrument: "기타" },
        { name: "유민혁", role: "BASS" as const, instrument: "베이스" },
        { name: "배소희", role: "DRUMS" as const, instrument: "드럼" },
      ],
    },
  ];

  const bands = await Promise.all(
    bandData.map(async (b) => {
      const { members, ...bandFields } = b;
      const band = await prisma.band.upsert({
        where: { slug: bandFields.slug },
        update: {},
        create: bandFields,
      });
      await prisma.bandMember.deleteMany({ where: { bandId: band.id } });
      await prisma.bandMember.createMany({
        data: members.map((m, idx) => ({ bandId: band.id, ...m, sortOrder: idx })),
      });
      return band;
    })
  );
  console.log(`✅ 밴드 ${bands.length}개`);

  // 밴드 맵
  const bandMap: Record<string, typeof bands[0]> = {};
  for (const b of bands) {
    bandMap[b.slug] = b;
  }

  // ─── 6. 공연 ────────────────────────────────────────────────────────────────
  const now = new Date();
  const futureDate = (daysFromNow: number, hour = 19, minute = 30) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const pastDate = (daysAgo: number, hour = 20, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const eventData = [
    // ── PUBLISHED (관람 가능) ──
    {
      title: "Parallel Echo — City Lights Tour",
      slug: "parallel-echo-city-lights-tour",
      summary: "홍대 롤링홀에서 펼치는 Parallel Echo의 신보 발매 기념 공연",
      description: "<p>Parallel Echo의 세 번째 정규 앨범 <em>City Lights</em> 발매를 기념하는 특별한 공연입니다. 신보 수록곡 전곡과 역대 히트곡을 함께 즐길 수 있는 스페셜 셋리스트로 구성됩니다.</p><p>서포트 밴드로 Static Bloom이 함께합니다.</p>",
      coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
      startsAt: futureDate(14), endsAt: futureDate(14, 22, 0),
      status: "PUBLISHED" as const,
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["rolling-hall"].id,
      bandId: bandMap["parallel-echo"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 35000, quantity: 150, remaining: 87, category: "GENERAL" as const },
        { name: "얼리버드", price: 25000, quantity: 50, remaining: 0, category: "EARLY_BIRD" as const },
      ],
    },
    {
      title: "Neon Dive — Electric Dreams",
      slug: "neon-dive-electric-dreams",
      summary: "CJ Azit에서 선보이는 Neon Dive의 신스팝 록 라이브",
      description: "<p>네온빛 무대 위에서 펼쳐지는 Neon Dive의 특별 공연입니다. 시각 아트와 결합된 몰입형 라이브 퍼포먼스를 경험하세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
      startsAt: futureDate(21), endsAt: futureDate(21, 22, 30),
      status: "PUBLISHED" as const,
      genreId: alternative.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["cj-azit"].id,
      bandId: bandMap["neon-dive"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 40000, quantity: 200, remaining: 142, category: "GENERAL" as const },
        { name: "VIP (포토타임 포함)", price: 80000, quantity: 20, remaining: 5, category: "VIP" as const },
      ],
    },
    {
      title: "Bluestone Quartet — Late Night Jazz",
      slug: "bluestone-quartet-late-night-jazz",
      summary: "올댓재즈에서 펼쳐지는 Bluestone Quartet의 레이트 나잇 재즈 공연",
      description: "<p>서울 최초의 재즈클럽 올댓재즈에서 펼쳐지는 Bluestone Quartet의 레이트 나잇 재즈 공연입니다. 위스키 한 잔과 함께 도시의 밤을 재즈로 채우세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
      startsAt: futureDate(7, 21, 0), endsAt: futureDate(7, 23, 30),
      status: "PUBLISHED" as const,
      genreId: jazz.id,
      regionId: districtMap["seoul-yongsan"].id,
      venueId: venueMap["all-that-jazz"].id,
      bandId: bandMap["bluestone-quartet"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반석", price: 30000, quantity: 100, remaining: 63, category: "GENERAL" as const },
      ],
    },
    {
      title: "Iron Sermon — Forged in Fire",
      slug: "iron-sermon-forged-in-fire",
      summary: "무신사 개러지를 불태울 Iron Sermon의 헤비메탈 공연",
      description: "<p>한국 헤비메탈의 자존심 Iron Sermon이 무신사 개러지에서 새 앨범 <em>Forged in Fire</em>의 수록곡을 최초 공개합니다. 귀마개 지참 권장!</p>",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      startsAt: futureDate(10, 20, 0), endsAt: futureDate(10, 23, 0),
      status: "PUBLISHED" as const,
      genreId: metal.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["musinsa-garage"].id,
      bandId: bandMap["iron-sermon"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 30000, quantity: 300, remaining: 201, category: "GENERAL" as const },
        { name: "VIP 피트", price: 55000, quantity: 50, remaining: 18, category: "VIP" as const },
      ],
    },
    {
      title: "Willow & Reed — 봄날의 속삭임",
      slug: "willow-and-reed-spring-whisper",
      summary: "마로니에 야외공연장에서 펼쳐지는 봄의 포크 공연",
      description: "<p>꽃향기 가득한 대학로 마로니에공원에서 Willow & Reed의 따뜻한 포크 공연이 열립니다. 잔디에 앉아 봄바람과 함께 감성에 젖어보세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
      startsAt: futureDate(5, 16, 0), endsAt: futureDate(5, 18, 30),
      status: "PUBLISHED" as const,
      genreId: folk.id,
      regionId: districtMap["seoul-jongno"].id,
      venueId: venueMap["marronnier-stage"].id,
      bandId: bandMap["willow-and-reed"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "무료 입장", price: 0, quantity: 500, remaining: 312, category: "GENERAL" as const },
      ],
    },
    {
      title: "Seoul Blues Band — Midnight at the Crossroads",
      slug: "seoul-blues-band-midnight",
      summary: "부기우기에서 펼쳐지는 깊은 밤의 블루스 세션",
      description: "<p>경리단길의 전설적인 재즈바 부기우기에서 Seoul Blues Band의 심야 블루스 세션이 열립니다. 한 주의 마지막 날, 블루스로 스트레스를 날려버리세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      startsAt: futureDate(3, 22, 0), endsAt: futureDate(4, 1, 0),
      status: "PUBLISHED" as const,
      genreId: blues.id,
      regionId: districtMap["seoul-yongsan"].id,
      venueId: venueMap["boogie-woogie"].id,
      bandId: bandMap["seoul-blues-band"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "입장+음료 1잔", price: 20000, quantity: 60, remaining: 22, category: "GENERAL" as const },
      ],
    },
    {
      title: "Groove Factory — Summer Groove Party",
      slug: "groove-factory-summer-party",
      summary: "에스팩토리에서 펼쳐지는 Groove Factory의 여름 파티",
      description: "<p>성수동 에스팩토리 루프탑에서 Groove Factory가 펼치는 여름 펑크 파티! 7인조 브라스 밴드가 만들어내는 그루브에 몸을 맡기세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1504892386946-dae3a43d5b68?w=800&q=80",
      startsAt: futureDate(28, 18, 0), endsAt: futureDate(28, 23, 0),
      status: "PUBLISHED" as const,
      genreId: funk.id,
      regionId: districtMap["seoul-seongdong"].id,
      venueId: venueMap["s-factory"].id,
      bandId: bandMap["groove-factory"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 45000, quantity: 400, remaining: 187, category: "GENERAL" as const },
        { name: "얼리버드", price: 33000, quantity: 100, remaining: 0, category: "EARLY_BIRD" as const },
      ],
    },
    {
      title: "CTRL+ALT — System Override",
      slug: "ctrl-alt-system-override",
      summary: "성수아트홀을 해킹하는 CTRL+ALT의 이머시브 일렉트로닉 퍼포먼스",
      description: "<p>CTRL+ALT의 <em>System Override</em> 공연은 단순한 음악 공연이 아닙니다. 프로젝션 맵핑, 실시간 비주얼 아트, 라이브 전자음악이 하나로 융합되는 이머시브 경험입니다.</p>",
      coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
      startsAt: futureDate(18, 20, 0), endsAt: futureDate(18, 23, 0),
      status: "PUBLISHED" as const,
      genreId: electronic.id,
      regionId: districtMap["seoul-seongdong"].id,
      venueId: venueMap["seongsu-art-hall"].id,
      bandId: bandMap["ctrl-alt"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 38000, quantity: 200, remaining: 104, category: "GENERAL" as const },
        { name: "VIP (전면 구역)", price: 65000, quantity: 40, remaining: 12, category: "VIP" as const },
      ],
    },
    {
      title: "Static Bloom — Dream in Static",
      slug: "static-bloom-dream-in-static",
      summary: "Club FF에서 펼쳐지는 Static Bloom의 슈게이징 라이브",
      description: "<p>홍대 Club FF의 어둠 속에서 Static Bloom의 노이즈 기타 이펙트가 물결칩니다. 꿈과 현실 사이 어딘가에서 길을 잃어보세요.</p>",
      coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      startsAt: futureDate(12, 21, 0), endsAt: futureDate(12, 23, 30),
      status: "PUBLISHED" as const,
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["club-ff"].id,
      bandId: bandMap["static-bloom"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 18000, quantity: 150, remaining: 73, category: "GENERAL" as const },
      ],
    },
    {
      title: "Late Summer — Afterglow 발매 기념 공연",
      slug: "late-summer-afterglow-showcase",
      summary: "KT&G 상상마당 홍대에서 펼쳐지는 Late Summer의 EP 발매 쇼케이스",
      description: "<p>Late Summer의 첫 번째 EP <em>Afterglow</em> 발매를 기념하는 특별 쇼케이스 공연입니다. 앨범 수록 전곡 라이브와 팬들과의 Q&A 세션이 예정되어 있습니다.</p>",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      startsAt: futureDate(9, 19, 0), endsAt: futureDate(9, 21, 30),
      status: "PUBLISHED" as const,
      genreId: alternative.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["sangsangmadang-hongdae"].id,
      bandId: bandMap["late-summer"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 25000, quantity: 250, remaining: 133, category: "GENERAL" as const },
        { name: "얼리버드", price: 18000, quantity: 50, remaining: 0, category: "EARLY_BIRD" as const },
      ],
    },
    // ── APPROVED (곧 게시 예정) ──
    {
      title: "Parallel Echo — Acoustic Session",
      slug: "parallel-echo-acoustic-session",
      summary: "어쿠스틱으로 듣는 Parallel Echo의 명곡들",
      description: "<p>전기 사운드를 벗어던진 Parallel Echo의 어쿠스틱 세션입니다. 익숙한 곡들을 새로운 방식으로 만나보세요.</p>",
      coverImage: null,
      startsAt: futureDate(35), endsAt: futureDate(35, 21, 30),
      status: "APPROVED" as const,
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["club-ff"].id,
      bandId: bandMap["parallel-echo"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 20000, quantity: 80, remaining: 80, category: "GENERAL" as const },
      ],
    },
    {
      title: "Bluestone Quartet — Jazz Brunch",
      slug: "bluestone-quartet-jazz-brunch",
      summary: "엔트리55 성수에서 즐기는 주말 재즈 브런치",
      description: "<p>주말 오전, 브런치와 함께 Bluestone Quartet의 경쾌한 재즈 연주를 감상하세요. 성수동의 여유로운 아침을 재즈로 시작합니다.</p>",
      coverImage: null,
      startsAt: futureDate(42, 11, 0), endsAt: futureDate(42, 14, 0),
      status: "APPROVED" as const,
      genreId: jazz.id,
      regionId: districtMap["seoul-seongdong"].id,
      venueId: venueMap["entry55-seongsu"].id,
      bandId: bandMap["bluestone-quartet"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "브런치 포함", price: 45000, quantity: 60, remaining: 60, category: "GENERAL" as const },
      ],
    },
    // ── PENDING (승인 대기) ──
    {
      title: "Indie Band Festival 2026",
      slug: "indie-band-festival-2026",
      summary: "서울 인디 밴드들이 모이는 연례 축제 — 올해도 롤링홀에서",
      description: "<p>Band-Stage가 주최하는 인디 밴드 페스티벌입니다. Parallel Echo, Static Bloom, Late Summer 등 10개 밴드가 무대를 꾸밉니다.</p>",
      coverImage: null,
      startsAt: futureDate(60, 14, 0), endsAt: futureDate(60, 23, 0),
      status: "PENDING" as const,
      genreId: indieRock.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["rolling-hall"].id,
      bandId: bandMap["parallel-echo"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 50000, quantity: 300, remaining: 300, category: "GENERAL" as const },
        { name: "VIP (백스테이지 투어 포함)", price: 100000, quantity: 30, remaining: 30, category: "VIP" as const },
      ],
    },
    {
      title: "Iron Sermon × Seoul Blues Band — Heavy Blues Night",
      slug: "heavy-blues-night",
      summary: "메탈과 블루스의 이색 콜라보 — DGBD에서 하룻밤",
      description: "<p>장르를 초월한 이색 콜라보! Iron Sermon의 헤비니스와 Seoul Blues Band의 그루브가 DGBD에서 충돌합니다. 두 밴드가 교대로 무대를 채우며 마지막엔 합동 잼 세션이 예정되어 있습니다.</p>",
      coverImage: null,
      startsAt: futureDate(50, 20, 0), endsAt: futureDate(50, 23, 30),
      status: "PENDING" as const,
      genreId: blues.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["dgbd"].id,
      bandId: bandMap["iron-sermon"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 25000, quantity: 200, remaining: 200, category: "GENERAL" as const },
      ],
    },
    // ── ARCHIVED (지난 공연) ──
    {
      title: "Neon Dive — Winter Sessions",
      slug: "neon-dive-winter-sessions",
      summary: "지난 겨울, Neon Dive가 만들어낸 따뜻한 전기 에너지",
      description: "<p>2025년 12월 진행된 Neon Dive의 겨울 특별 공연 아카이브입니다.</p>",
      coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
      startsAt: pastDate(90, 20, 0), endsAt: pastDate(90, 22, 30),
      status: "ARCHIVED" as const,
      genreId: alternative.id,
      regionId: districtMap["seoul-mapo"].id,
      venueId: venueMap["musinsa-garage"].id,
      bandId: bandMap["neon-dive"].id,
      ownerId: artistUser.id,
      ticketTypes: [
        { name: "일반", price: 35000, quantity: 400, remaining: 0, category: "GENERAL" as const },
      ],
    },
  ];

  for (const e of eventData) {
    const { ticketTypes, ...fields } = e;
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        ...fields,
        publishedAt: e.status === "PUBLISHED" || e.status === "ARCHIVED" ? new Date() : null,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            name: tt.name, price: tt.price, currency: "KRW",
            quantity: tt.quantity, remaining: tt.remaining,
            category: tt.category, perUserLimit: 4,
          })),
        },
      },
    });
  }
  console.log(`✅ 공연 ${eventData.length}개`);

  console.log("\n🎉 시드 완료!");
  console.log("\n📋 테스트 계정:");
  console.log("  관리자: admin@bandstage.kr / admin1234!");
  console.log("  아티스트: artist@bandstage.kr / artist1234!");
  console.log("  공연장: venue@bandstage.kr / venue1234!");
  console.log("  팬: fan@bandstage.kr / fan12345!");
  console.log("\n  데모 계정 (DB 불필요):");
  console.log("  admin@bandstage.dev / admin1234!");
  console.log("  artist@bandstage.dev / artist1234!");
  console.log("  venue@bandstage.dev / venue1234!");
  console.log("\n🏟 공연장 25개 (홍대5, 강남권5, 이태원5, 성수5, 종로5)");
  console.log("🎸 밴드 10개 (인디록2, 얼터너티브2, 재즈1, 메탈1, 포크1, 블루스1, 펑크1, 일렉트로닉1)");
  console.log("🎵 공연 15개 (PUBLISHED 10, APPROVED 2, PENDING 2, ARCHIVED 1)");
}

main()
  .catch((e) => { console.error("❌ 시드 실패:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// 공통 유틸리티 함수

/**
 * 한국어/영문 혼용 문자열로 URL 슬러그 생성
 */
export function createSlug(text: string, suffix?: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return suffix ? `${base}-${suffix}` : base;
}

/**
 * 날짜 포맷 (한국어)
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * 날짜+시간 포맷 (한국어)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateObj);
}

/**
 * 상대 시간 포맷 (예: "3일 전", "방금 전")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(dateObj);
}

/**
 * 가격 포맷 (원화)
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "무료";
  if (amount === 0) return "무료";
  return `₩${amount.toLocaleString("ko-KR")}`;
}

/**
 * 공연장 수용 인원 범위 포맷
 */
export function formatCapacity(min?: number | null, max?: number | null): string {
  if (!min && !max) return "정보 없음";
  if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()}명`;
  if (max) return `최대 ${max.toLocaleString()}명`;
  return `${min!.toLocaleString()}명+`;
}

/**
 * 고유 슬러그 생성 (DB 중복 확인 포함)
 */
export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = createSlug(text);
  let slug = base;
  let counter = 1;
  while (await checkExists(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * 이벤트 상태 라벨 (한국어)
 */
export const EVENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "임시저장",
  PENDING: "승인 대기",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  PUBLISHED: "게시됨",
  ARCHIVED: "아카이브",
};

/**
 * 이벤트 상태 색상 클래스
 */
export const EVENT_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

/**
 * 역할 라벨 (한국어)
 */
export const ROLE_LABEL: Record<string, string> = {
  FAN: "팬",
  ARTIST: "아티스트",
  VENUE: "공연장",
  ADMIN: "관리자",
};

/**
 * 텍스트 자르기 (말줄임)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * 클래스명 병합 (조건부)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * D-day 계산
 */
export function getDday(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "종료";
  if (diffDays === 0) return "D-Day";
  return `D-${diffDays}`;
}

/**
 * 페이지네이션 메타 계산
 */
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

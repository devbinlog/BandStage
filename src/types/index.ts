// 도메인 타입 정의

export type UserRole = "FAN" | "ARTIST" | "VENUE" | "ADMIN";
export type EventStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED" | "ARCHIVED";
export type TicketStatus = "UNPAID" | "PENDING" | "CONFIRMED" | "CANCELLED";
export type VenueType = "LIVE_CLUB" | "CONCERT_HALL" | "OUTDOOR" | "MULTIPLEX" | "BAR" | "OTHER";
export type BookmarkTargetType = "EVENT" | "VENUE" | "BAND";

// 공연 목록 아이템
export interface PerformanceListItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  coverImage?: string | null;
  startsAt: Date;
  endsAt?: Date | null;
  status: EventStatus;
  genre?: { id: string; name: string; color?: string | null } | null;
  venue?: { id: string; name: string; city?: string | null } | null;
  band?: { id: string; name: string; slug: string } | null;
  ticketTypes?: { price: number | null }[];
}

// 공연장 목록 아이템
export interface VenueListItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  district?: string | null;
  capacityMin?: number | null;
  capacityMax?: number | null;
  venueType: VenueType;
  tags: string[];
  isVerified: boolean;
  images?: { url: string }[];
}

// 밴드 목록 아이템
export interface BandListItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  genre?: { id: string; name: string; color?: string | null } | null;
  region?: { id: string; name: string } | null;
  members?: { id: string; name: string; role: string }[];
  _count?: { events: number };
}

// 지역
export interface RegionItem {
  id: string;
  slug: string;
  name: string;
  level: number;
  children?: RegionItem[];
  _count?: { venues: number; events: number };
}

// 페이지네이션 메타
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

// API 응답
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

// 필터 파라미터
export interface PerformanceFilterParams {
  status?: EventStatus;
  genreId?: string;
  regionId?: string;
  venueId?: string;
  bandId?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface VenueFilterParams {
  regionId?: string;
  venueType?: VenueType;
  capacityMin?: number;
  capacityMax?: number;
  q?: string;
  page?: number;
  limit?: number;
}

// 서버 액션 결과
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

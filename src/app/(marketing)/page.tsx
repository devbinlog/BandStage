"use client";

import Link from "next/link";
import { useState } from "react";

const heroLinks = [
  { href: "/events", label: "공연 둘러보기" },
  { href: "/venues", label: "공연장 찾기" },
];

const upcomingShows = [
  {
    title: "City Lights Session",
    band: "Neon Dive",
    venue: "롤링홀",
    date: "11월 28일",
    status: "예매 오픈",
  },
  {
    title: "Hidden Tracks vol.2",
    band: "Glasswave",
    venue: "CJ Azit",
    date: "12월 3일",
    status: "Soon",
  },
  {
    title: "Echo Bloom",
    band: "Parallel Echo",
    venue: "KT&G 상상마당",
    date: "12월 14일",
    status: "D-7",
  },
  {
    title: "Midnight Sound",
    band: "Urban Echo",
    venue: "클럽 FF",
    date: "12월 20일",
    status: "예매 오픈",
  },
  {
    title: "Winter Fest",
    band: "Snow Band",
    venue: "올림픽공원",
    date: "12월 25일",
    status: "D-10",
  },
  {
    title: "New Year Concert",
    band: "Celebration",
    venue: "예술의전당",
    date: "1월 1일",
    status: "Soon",
  },
];

const platformPillars = [
  {
    title: "밴드에게",
    description: "공연 등록, 대관 정보, 예매까지 한 흐름으로",
  },
  {
    title: "팬에게",
    description: "믿을 수 있는 공연 정보와 감성 있는 큐레이션",
  },
  {
    title: "씬 전체",
    description: "공연장 → 공연 → 밴드 → 팬을 잇는 인프라",
  },
];


export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const showsPerPage = 3;
  const maxIndex = Math.max(0, upcomingShows.length - showsPerPage);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };


  return (
    <div className="space-y-20">
      <section className="rounded-[32px] bg-gradient-to-br from-[#d4e5ff] via-[#f0f7ff] to-[#a8c2ff] p-8 sm:p-12">
        <div className="space-y-6 text-[#0b1021]">
          <p className="text-sm tracking-[0.6em] lg:text-[#0d1e7a] text-[#1f40b5]">PLATFORM FOR BANDS</p>
          <h1 className="text-4xl font-semibold leading-snug sm:text-5xl">
            많은 밴드의 공연과
            <br />
            여러 공연장들을 찾아보세요
          </h1>
          <p className="max-w-2xl text-lg text-[#334163]">
            공연 등록, 공연장 검색, 예매의 흐름까지 하나로 이어지는 공연 플랫폼.
            <br />
            수 많은 공연들을 만나보세요.
          </p>
          <div className="flex flex-wrap gap-3">
            {heroLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="rounded-full bg-[#1436f5] lg:bg-[#0d28c4] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#1436f5]/30 lg:shadow-[#0d28c4]/30 transition hover:translate-y-0.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#5b6ba5]">UPCOMING</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0b1021]">다가오는 공연</h2>
          </div>
          <Link href="/events" className="text-sm text-[#1436f5] lg:text-[#0d28c4] hover:underline">
            전체 보기 →
          </Link>
        </header>
        <div className="relative rounded-3xl border border-[#e0e6ff] bg-white p-4 shadow-sm">
          {/* Mobile: Grid view */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {upcomingShows.map((show) => (
              <div key={show.title} className="rounded-2xl border border-[#edf1ff] bg-[#f8f9ff] p-4">
                <p className="text-xs text-[#5b6ba5]">{show.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#0b1021]">{show.title}</h3>
                <p className="text-sm text-[#46506b]">{show.band} · {show.venue}</p>
                <span className="mt-4 inline-flex rounded-full bg-[#1436f5]/10 px-3 py-1 text-xs font-medium text-[#1436f5]">
                  {show.status}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop: Slider view */}
          <div className="hidden lg:block relative px-10">
            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-300 ease-in-out" 
                style={{ 
                  transform: `translateX(calc(-${currentIndex} * ((100% - 1.5rem) / ${showsPerPage} + 0.75rem)))`,
                  gap: '0.75rem'
                }}
              >
                {upcomingShows.map((show) => (
                  <div
                    key={show.title}
                    className="flex-shrink-0"
                    style={{ width: `calc((100% - 1.5rem) / ${showsPerPage})` }}
                  >
                    <div className="rounded-2xl border border-[#edf1ff] bg-[#f8f9ff] p-4">
                      <p className="text-xs text-[#5b6ba5]">{show.date}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#0b1021]">{show.title}</h3>
                      <p className="text-sm text-[#46506b]">{show.band} · {show.venue}</p>
                      <span className="mt-4 inline-flex rounded-full bg-[#0d28c4]/10 px-3 py-1 text-xs font-medium text-[#0d28c4]">
                        {show.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {upcomingShows.length > showsPerPage && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white border border-gray-300 p-1.5 shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="이전 공연"
                  disabled={currentIndex === 0}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white border border-gray-300 p-1.5 shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="다음 공연"
                  disabled={currentIndex >= maxIndex}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-[#dfe6ff] bg-white p-6 shadow-sm">
          <p className="text-xs tracking-[0.4em] text-[#5b6ba5]">WHY</p>
          <h2 className="text-2xl font-semibold text-[#0b1021]">Band-Stage의 핵심</h2>
          <ul className="space-y-4">
            {platformPillars.map((pillar) => (
              <li key={pillar.title} className="rounded-2xl border border-[#f0f2ff] bg-[#f8f9ff] p-4">
                <p className="text-sm font-semibold text-[#1436f5] lg:text-[#0d28c4]">{pillar.title}</p>
                <p className="text-sm text-[#3a4665]">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[32px] border border-[#dfe3fc] bg-gradient-to-br from-white to-[#f3f6ff] p-8">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.5em] text-[#5b6ba5]">VENUE GUIDE</p>
              <h2 className="text-2xl font-semibold text-[#0b1021]">첫 공연을 준비 중인가요?</h2>
              <p className="text-sm text-[#3a4665]">
                서울의 라이브클럽과 복합 공연장을 한눈에 비교하고, 대관 조건 · 음향 · 분위기를 미리 파악하세요.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-2 text-sm text-[#3a4665]">
                  <span className="mt-0.5 text-[#1436f5] lg:text-[#0d28c4]">•</span>
                  <span>대관 비용과 시간대별 요금 정보 제공</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#3a4665]">
                  <span className="mt-0.5 text-[#1436f5] lg:text-[#0d28c4]">•</span>
                  <span>음향 시스템과 무대 크기 상세 비교</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-[#3a4665]">
                  <span className="mt-0.5 text-[#1436f5] lg:text-[#0d28c4]">•</span>
                  <span>수용 인원과 공연 분위기 미리보기</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-end">
              <Link
                href="/venues"
                className="inline-flex w-fit rounded-full border border-[#1436f5] lg:border-[#0d28c4] px-6 py-2 text-sm font-semibold text-[#1436f5] lg:text-[#0d28c4] transition hover:bg-[#1436f5] lg:hover:bg-[#0d28c4] hover:text-white"
              >
                공연장 가이드 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  paramName?: string;
}

export function SearchBar({
  placeholder = "검색어 입력...",
  defaultValue = "",
  paramName = "q",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(paramName, value.trim());
    } else {
      params.delete(paramName);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[#0d28c4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0b1fb5] transition-colors disabled:opacity-60"
      >
        {isPending ? "..." : "검색"}
      </button>
    </form>
  );
}

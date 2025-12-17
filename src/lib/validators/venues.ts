import { z } from "zod";

export const venueSuggestionSchema = z.object({
  name: z.string().min(2, "공연장 이름을 입력해주세요"),
  address: z.string().min(3).max(200).optional().or(z.literal("")),
  contact: z.string().max(120).optional().or(z.literal("")),
  naverMapUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type VenueSuggestionInput = z.infer<typeof venueSuggestionSchema>;

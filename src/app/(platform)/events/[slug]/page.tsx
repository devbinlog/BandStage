import { redirect } from "next/navigation";

// /events/[slug] → /performances/[slug] 리다이렉트
export default async function EventDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/performances/${slug}`);
}

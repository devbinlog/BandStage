const posts = [
  {
    title: "11월 쇼케이스 후기",
    author: "팬 A",
    date: "11.05",
    comments: 12,
    excerpt: "첫 곡부터 에너지 장난 아니었어요!",
  },
  {
    title: "신곡 가사 떴나요?",
    author: "팬 B",
    date: "11.01",
    comments: 5,
    excerpt: "밴드 캠프에서 봤다는 소식이...",
  },
];

export default function BandCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Fan community</p>
        <h1 className="text-3xl font-semibold text-gray-900">커뮤니티</h1>
        <p className="text-sm text-gray-600">팬과 밴드가 소통하는 공간입니다.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-600">로그인한 팬만 글을 쓸 수 있어요.</p>
        <form className="mt-3 space-y-3">
          <input className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900" placeholder="제목" />
          <textarea className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900" rows={4} placeholder="내용" />
          <button className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800" type="button">
            게시
          </button>
        </form>
      </div>
      <section className="space-y-4">
        {posts.map((post) => (
          <article key={post.title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">{post.title}</h2>
            <p className="text-sm text-gray-700">{post.excerpt}</p>
            <p className="mt-3 text-xs text-emerald-600">댓글 {post.comments}개</p>
          </article>
        ))}
      </section>
    </div>
  );
}

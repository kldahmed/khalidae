type KPost = {
  id: string;
  content: string;
  media_url?: string | null;
  created_at: string;
  author?: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export default function KPostCard({ post }: { post: KPost }) {
  const username = post.author?.username || 'user';
  const fullName = post.author?.full_name || 'K User';

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-full border border-zinc-700 bg-zinc-800 overflow-hidden">
          {post.author?.avatar_url ? (
            <img src={post.author.avatar_url} alt={fullName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-zinc-100">{fullName}</span>
            <span className="text-zinc-500">@{username}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">{new Date(post.created_at).toLocaleString('ar-EG')}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-zinc-200">{post.content}</p>
          {post.media_url ? (
            <div className="mt-3 rounded-xl border border-zinc-800 p-3 text-xs text-zinc-400 break-all">{post.media_url}</div>
          ) : null}
          <div className="mt-4 flex items-center gap-5 text-xs text-zinc-500">
            <button type="button" disabled className="hover:text-zinc-300 transition-colors">رد</button>
            <button type="button" disabled className="hover:text-zinc-300 transition-colors">إعادة نشر</button>
            <button type="button" disabled className="hover:text-zinc-300 transition-colors">إعجاب</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="font-bold text-xl mb-2">{post.title}</div>
      <div className="text-white/70 mb-2 line-clamp-3">{post.content}</div>
      <div className="text-white/40 text-xs">{new Date(post.created_at).toLocaleString('ar-EG')}</div>
    </div>
  );
}

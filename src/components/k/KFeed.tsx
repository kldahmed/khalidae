import KPostCard from '@/components/k/KPostCard';

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

export default function KFeed({ posts }: { posts: KPost[] }) {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-10 text-center text-zinc-400">
        لا توجد منشورات بعد. كن أول من يكتب في K.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <KPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

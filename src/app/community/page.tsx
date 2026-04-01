import PostCard from '@/components/community/PostCard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold mb-4">Community</h1>
          <p className="text-white/70">
            Community is temporarily unavailable.
          </p>
        </div>
      </main>
    );
  }

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('id, title, content, author_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold mb-4">المجتمع</h1>
          <p className="text-white/70">تعذر تحميل بيانات المجتمع حاليًا.</p>
        </div>
      </main>
    );
  }

  // Assume session check for CTA
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">المجتمع</h1>
        <section className="mb-8">
          <p className="text-white/70 mb-4">مرحبًا بك في مجتمع خالدية! شارك أفكارك وتواصل مع الأعضاء.</p>
          {session ? (
            <Link href="/community/new" className="inline-block px-6 py-2 rounded-lg bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition">اكتب منشورًا</Link>
          ) : (
            <Link href="/signup" className="inline-block px-6 py-2 rounded-lg bg-white/10 border border-white/20 font-semibold hover:bg-white/20 transition">انضم للمجتمع</Link>
          )}
        </section>
        <section>
          {posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="text-center text-white/60 py-12">لا يوجد منشورات بعد.</div>
          )}
        </section>
      </div>
    </main>
  );
}

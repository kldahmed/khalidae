import Link from 'next/link';
import KComposer from '@/components/k/KComposer';
import KFeed from '@/components/k/KFeed';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function KPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-5xl font-semibold tracking-tight">K</h1>
          <p className="mt-4 text-zinc-400">التغذية غير متاحة حاليًا.</p>
        </div>
      </main>
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: posts, error } = await supabase
    .from('k_posts')
    .select('id, author_id, content, media_url, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-5xl font-semibold tracking-tight">K</h1>
          <p className="mt-4 text-zinc-400">تعذر تحميل التغذية حاليًا.</p>
        </div>
      </main>
    );
  }

  const authorIds = Array.from(new Set((posts || []).map((p) => p.author_id).filter(Boolean)));
  const profileMap = new Map<string, { username: string | null; full_name: string | null; avatar_url: string | null }>();

  if (authorIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', authorIds);

    (profiles || []).forEach((profile) => {
      profileMap.set(profile.id, {
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });
    });
  }

  const safePosts = (posts || []).map((post) => ({
    id: post.id,
    content: post.content,
    media_url: post.media_url,
    created_at: post.created_at,
    author: profileMap.get(post.author_id) || null,
  }));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h1 className="text-5xl font-semibold tracking-tight">K</h1>
            <p className="mt-2 text-zinc-400">مساحة منشورات قصيرة بهوية KAR.</p>
          </div>

          {session ? (
            <KComposer compact />
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 text-zinc-300">
              سجّل الدخول للمشاركة في K.
              <div className="mt-4 flex gap-3">
                <Link href="/login" className="rounded-lg border border-zinc-700 px-4 py-2 hover:border-zinc-500">Login</Link>
                <Link href="/signup" className="rounded-lg border border-zinc-700 px-4 py-2 hover:border-zinc-500">Signup</Link>
              </div>
            </div>
          )}

          <KFeed posts={safePosts} />
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-lg font-semibold">روابط سريعة</h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <Link href="/members" className="block hover:text-zinc-200">الأعضاء</Link>
              <Link href="/contact" className="block hover:text-zinc-200">تواصل</Link>
              <Link href="/account" className="block hover:text-zinc-200">الحساب</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

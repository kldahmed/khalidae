import Link from 'next/link';
import KComposer from '@/components/k/KComposer';
import KFeed from '@/components/k/KFeed';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function KPostSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-48 rounded bg-zinc-800" />
          <div className="h-3 w-full rounded bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-800" />
          <div className="h-3 w-32 rounded bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export default async function KPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h1 className="text-5xl font-semibold tracking-tight">K</h1>
              <p className="mt-2 text-zinc-300">منصة اجتماعية قصيرة المدى بهوية KAR.</p>
              <p className="mt-3 text-zinc-400">ابدأ مجتمع K من أول منشور. فعّل المجتمع وأكمل الإطلاق.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500">انضم الآن</Link>
                <Link href="/contact" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500">تواصل للدعم</Link>
              </div>
            </div>
            <KPostSkeleton />
            <KPostSkeleton />
            <KPostSkeleton />
          </section>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-lg font-semibold">حول K</h2>
              <p className="mt-2 text-sm text-zinc-400">تجربة نشر قصيرة، بسيطة، وسريعة ضمن بيئة KAR.</p>
            </div>
          </aside>
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
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h1 className="text-5xl font-semibold tracking-tight">K</h1>
              <p className="mt-2 text-zinc-300">K Social Feed</p>
              <p className="mt-3 text-zinc-400">تعذر تحميل التغذية الآن، لكن الإطلاق مستمر.</p>
            </div>
            <KPostSkeleton />
            <KPostSkeleton />
          </section>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-lg font-semibold">روابط سريعة</h2>
              <div className="mt-3 space-y-2 text-sm text-zinc-400">
                <Link href="/signup" className="block hover:text-zinc-200">إنشاء حساب</Link>
                <Link href="/login" className="block hover:text-zinc-200">تسجيل الدخول</Link>
              </div>
            </div>
          </aside>
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

  const postCount = safePosts.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h1 className="text-5xl font-semibold tracking-tight">K</h1>
            <p className="mt-2 text-zinc-300">مساحة اجتماعية قصيرة بأسلوب KAR.</p>
            <p className="mt-2 text-sm text-zinc-500">Timeline سريع، منشورات مركزة، وتدفق نظيف.</p>
          </div>

          {session ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">ابدأ منشورًا جديدًا</h2>
                <Link href="/k/new" className="text-sm text-zinc-300 hover:text-zinc-100">Composer كامل</Link>
              </div>
              <KComposer compact />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/35 p-5">
              <h2 className="text-lg font-semibold">شارك في K</h2>
              <p className="mt-2 text-sm text-zinc-400">أنشئ حسابًا أو سجّل الدخول لكتابة أول منشورك.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/signup" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500">إنشاء حساب</Link>
                <Link href="/login" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500">تسجيل الدخول</Link>
              </div>
            </div>
          )}

          {postCount ? (
            <KFeed posts={safePosts} />
          ) : (
            <>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-7 text-center">
                <h3 className="text-2xl font-semibold">لا توجد منشورات بعد</h3>
                <p className="mt-2 text-zinc-400">كن أول من يبدأ مجتمع K.</p>
                <div className="mt-4 flex justify-center">
                  <Link
                    href={session ? '/k/new' : '/signup'}
                    className="rounded-lg border border-zinc-700 px-5 py-2 text-sm hover:border-zinc-500"
                  >
                    {session ? 'اكتب أول منشور' : 'انضم الآن'}
                  </Link>
                </div>
              </div>
              <KPostSkeleton />
              <KPostSkeleton />
              <KPostSkeleton />
            </>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-lg font-semibold">حول K</h2>
            <p className="mt-2 text-sm text-zinc-400">K مساحة تحديثات سريعة حول الأفكار، الأدوات، والمشاريع تحت هوية KAR.</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-lg font-semibold">إحصائيات سريعة</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-zinc-800 p-3">
                <div className="text-zinc-500">المنشورات</div>
                <div className="mt-1 text-xl font-semibold">{postCount}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 p-3">
                <div className="text-zinc-500">الحالة</div>
                <div className="mt-1 text-xl font-semibold">V1</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-lg font-semibold">روابط سريعة</h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <Link href="/members" className="block hover:text-zinc-200">الأعضاء</Link>
              <Link href="/contact" className="block hover:text-zinc-200">تواصل</Link>
              {session ? <Link href="/account" className="block hover:text-zinc-200">الحساب</Link> : null}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

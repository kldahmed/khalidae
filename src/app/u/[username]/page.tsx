import { notFound } from 'next/navigation';
import KPostCard from '@/components/k/KPostCard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProfileParams = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: ProfileParams) {
  const { username } = await params;
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">@{username}</h1>
          <p className="mt-3 text-zinc-400">الملف غير متاح حاليًا.</p>
        </div>
      </main>
    );
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, cover_url, website, location, created_at')
    .eq('username', username)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('k_posts')
    .select('id, content, media_url, created_at')
    .eq('author_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const decoratedPosts = (posts || []).map((post) => ({
    ...post,
    author: {
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
  }));

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="h-36 bg-gradient-to-r from-zinc-800 to-zinc-900" style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
          <div className="p-6">
            <div className="-mt-16 h-24 w-24 overflow-hidden rounded-full border-4 border-zinc-900 bg-zinc-800">
              {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name || profile.username || 'user'} className="h-full w-full object-cover" /> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{profile.full_name || profile.username}</h1>
            <p className="text-zinc-400">@{profile.username}</p>
            {profile.bio ? <p className="mt-3 text-zinc-300">{profile.bio}</p> : null}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
              {profile.location ? <span>{profile.location}</span> : null}
              {profile.website ? <span>{profile.website}</span> : null}
              <span>انضم: {profile.created_at ? new Date(profile.created_at).toLocaleDateString('ar-EG') : '-'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {decoratedPosts.length ? (
            decoratedPosts.map((post) => <KPostCard key={post.id} post={post} />)
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-zinc-400">
              لا توجد منشورات لهذا المستخدم بعد.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import ProfileForm from '@/components/account/ProfileForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-16">
        <div className="w-full max-w-xl p-8 rounded-2xl border border-white/10 bg-white/5">
          <h1 className="text-3xl font-bold mb-4 text-center">حسابي</h1>
          <p className="text-white/70 text-center">الخدمة غير متاحة مؤقتًا.</p>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-16">
        <div className="w-full max-w-xl p-8 rounded-2xl border border-white/10 bg-white/5">
          <h1 className="text-3xl font-bold mb-4 text-center">حسابي</h1>
          <p className="text-white/70 text-center">يرجى تسجيل الدخول للمتابعة.</p>
        </div>
      </main>
    );
  }
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
      username: typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : null,
    },
    { onConflict: 'id' },
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const safeProfile = profile ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: (typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null),
    username: (typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : null),
    bio: null,
    avatar_url: null,
    cover_url: null,
    website: null,
    location: null,
    created_at: null,
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl p-8 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-3xl font-bold mb-6 text-center">حسابي</h1>
        <ProfileForm profile={safeProfile} />
      </div>
    </main>
  );
}

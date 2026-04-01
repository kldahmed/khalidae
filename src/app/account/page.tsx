import ProfileForm from '@/components/account/ProfileForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // This should be protected by middleware, but fallback just in case
    return null;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl p-8 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-3xl font-bold mb-6 text-center">حسابي</h1>
        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}

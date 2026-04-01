import MemberCard from '@/components/members/MemberCard';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function MembersPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold mb-8">الأعضاء</h1>
          <div className="text-center text-white/60 py-12">الخدمة غير متاحة مؤقتًا.</div>
        </div>
      </main>
    );
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, avatar_url')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">الأعضاء</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members && members.length > 0 ? (
            members.map((member) => <MemberCard key={member.id} member={member} />)
          ) : (
            <div className="col-span-full text-center text-white/60 py-12">لا يوجد أعضاء بعد.</div>
          )}
        </div>
      </div>
    </main>
  );
}

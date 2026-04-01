import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewPostForm from '@/components/community/NewPostForm';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    redirect('/login');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }
  // Form component to be implemented
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-lg p-8 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-bold mb-6 text-center">منشور جديد</h1>
        <NewPostForm />
      </div>
    </main>
  );
}

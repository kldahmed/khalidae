import { redirect } from 'next/navigation';
import KComposer from '@/components/k/KComposer';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function KNewPage() {
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

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-4xl font-semibold tracking-tight">منشور جديد في K</h1>
        <KComposer onSuccessRedirect="/k" />
      </div>
    </main>
  );
}

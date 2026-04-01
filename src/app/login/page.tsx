import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 pt-24 pb-16">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-3xl font-bold mb-6 text-center">تسجيل الدخول</h1>
        {!authConfigured ? (
          <div className="mb-5 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm">
            <p className="font-medium text-zinc-100">الدخول غير مفعل حتى تتم إضافة متغيرات Supabase في Vercel</p>
            <p className="mt-2 text-zinc-400">
              {"Vercel → Project → Settings → Environment Variables"}
            </p>
            <ul className="mt-3 space-y-1 text-zinc-300">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>NEXT_PUBLIC_SITE_URL</li>
            </ul>
          </div>
        ) : null}
        <AuthForm mode="login" authConfigured={authConfigured} />
      </div>
    </main>
  );
}

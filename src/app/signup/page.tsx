import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function SignupPage() {
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-6 pt-24 pb-16">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">ابدأ حسابك في K</h1>
        <p className="mt-3 text-center text-zinc-400">منشورات قصيرة، ملف شخصي واضح، وتجربة اجتماعية متناسقة مع KAR.</p>

        {!authConfigured ? (
          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm">
            <p className="font-medium text-zinc-100">التسجيل غير مفعل حتى تتم إضافة متغيرات Supabase في Vercel</p>
            <p className="mt-2 text-zinc-400">Vercel -> Project -> Settings -> Environment Variables</p>
            <ul className="mt-3 space-y-1 text-zinc-300">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>NEXT_PUBLIC_SITE_URL</li>
            </ul>
          </div>
        ) : null}

        <div className="mt-8">
          <AuthForm mode="signup" authConfigured={authConfigured} />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-zinc-100 hover:text-white underline underline-offset-4">
            سجّل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}

import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-6 pt-24 pb-16">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">ابدأ حسابك في K</h1>
        <p className="mt-3 text-center text-zinc-400">منشورات قصيرة، ملف شخصي واضح، وتجربة اجتماعية متناسقة مع KAR.</p>

        <div className="mt-8">
        <AuthForm mode="signup" />
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

import AuthForm from '@/components/auth/AuthForm';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-3xl font-bold mb-6 text-center">استعادة كلمة المرور</h1>
        <AuthForm mode="forgot-password" />
      </div>
    </main>
  );
}

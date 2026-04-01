"use client";
import { type FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/FormElements';

export default function AuthForm({
  mode,
  authConfigured = true,
}: {
  mode: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  authConfigured?: boolean;
}) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot-password';
  const isReset = mode === 'reset-password';
  const isUnavailable = !authConfigured || !supabase;

  const submitLabel = isLogin
    ? 'تسجيل الدخول'
    : isSignup
      ? 'إنشاء الحساب'
      : isForgot
        ? 'إرسال رابط الاستعادة'
        : 'تحديث كلمة المرور';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabase) {
      setStatus('error');
      setMessage('خدمة الحسابات غير متاحة مؤقتًا.');
      return;
    }

    setStatus('loading');
    setMessage('');

    if (isSignup && (!fullName.trim() || !username.trim() || !email.trim() || password.length < 8)) {
      setStatus('error');
      setMessage('يرجى إدخال الاسم الكامل واسم المستخدم وبريد صحيح وكلمة مرور لا تقل عن 8 أحرف.');
      return;
    }

    if (isLogin && (!email.trim() || password.length < 8)) {
      setStatus('error');
      setMessage('يرجى إدخال البريد وكلمة المرور بشكل صحيح.');
      return;
    }

    if (isForgot && !email.trim()) {
      setStatus('error');
      setMessage('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (isReset && password.length < 8) {
      setStatus('error');
      setMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'تعذر تسجيل الدخول.');
        return;
      }
      setStatus('success');
      window.location.href = '/account';
      return;
    }

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: {
            full_name: fullName,
            username,
          },
        },
      });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'تعذر إنشاء الحساب.');
        return;
      }
      setStatus('success');
      setMessage('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.');
      window.setTimeout(() => {
        window.location.href = '/login?signup=success';
      }, 800);
      return;
    }

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'تعذر إرسال رابط الاستعادة.');
        return;
      }
      setStatus('success');
      setMessage('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setMessage(error.message || 'تعذر تحديث كلمة المرور.');
      return;
    }
    setStatus('success');
    setMessage('تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isUnavailable && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-4 text-sm">
          <p className="font-medium text-zinc-100">خدمة المصادقة غير مهيأة حاليًا</p>
          <p className="mt-1 text-zinc-400">
            {isLogin
              ? 'الدخول غير مفعل حتى تتم إضافة متغيرات Supabase في Vercel.'
              : 'التسجيل غير مفعل حتى تتم إضافة متغيرات Supabase في Vercel.'}
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100">العودة للرئيسية</Link>
            <Link href="/contact" className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100">التواصل معنا</Link>
          </div>
        </div>
      )}

      {isSignup && (
        <>
          <div>
            <Label htmlFor="full-name">الاسم الكامل</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="الاسم الكامل"
              required
            />
          </div>
          <div>
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
            />
          </div>
        </>
      )}

      {!isReset && (
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>
      )}

      {!isForgot && (
        <div>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            minLength={8}
          />
        </div>
      )}

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>
      )}

      <Button type="submit" disabled={status === 'loading' || isUnavailable} className="w-full">
        {status === 'loading' ? 'جاري التنفيذ...' : submitLabel}
      </Button>
    </form>
  );
}

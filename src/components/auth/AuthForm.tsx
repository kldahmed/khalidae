"use client";
import { type FormEvent, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/FormElements';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' | 'forgot-password' | 'reset-password' }) {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabase) {
      setStatus('error');
      setMessage('خدمة الحسابات غير متاحة مؤقتًا.');
      return;
    }

    setStatus('loading');
    setMessage('');

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
      {!supabase && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-200 text-sm">
          خدمة الحسابات غير متاحة مؤقتًا.
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

      <Button type="submit" disabled={!supabase || status === 'loading'} className="w-full">
        {status === 'loading' ? 'جاري التنفيذ...' : 'متابعة'}
      </Button>
    </form>
  );
}

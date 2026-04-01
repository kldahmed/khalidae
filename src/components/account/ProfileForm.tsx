"use client";
import { type FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/FormElements';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Profile = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  website?: string | null;
  location?: string | null;
  created_at?: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(profile?.cover_url || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleAvatarUpload(file: File) {
    if (!supabase || !profile?.id) {
      setStatus('error');
      setMessage('تعذر رفع الصورة حاليًا.');
      return;
    }

    const path = `${profile.id}/avatar-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'فشل رفع الصورة.');
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        username,
        bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        website,
        location,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus('error');
      setMessage(payload?.error || 'فشل تحديث الملف الشخصي.');
      return;
    }

    setStatus('success');
    setMessage('تم تحديث الملف الشخصي بنجاح.');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="username">اسم المستخدم</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" value={profile?.email || ''} disabled />
      </div>

      <div>
        <Label htmlFor="bio">نبذة</Label>
        <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="avatar">الصورة الشخصية</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleAvatarUpload(file);
            }
          }}
          disabled={!supabase}
        />
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="mt-3 h-16 w-16 rounded-full object-cover border border-white/10" />
        ) : null}
      </div>

      <div>
        <Label htmlFor="cover-url">رابط الغلاف</Label>
        <Input id="cover-url" type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
      </div>

      <div>
        <Label htmlFor="website">الموقع</Label>
        <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-site.com" />
      </div>

      <div>
        <Label htmlFor="location">الموقع الجغرافي</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Riyadh, SA" />
      </div>

      <div className="text-sm text-white/60">
        تاريخ الإنشاء: {profile?.created_at ? new Date(profile.created_at).toLocaleString('ar-EG') : 'غير متاح'}
      </div>

      {message ? <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </Button>
        <Button type="button" variant="outline" onClick={handleLogout}>
          تسجيل الخروج
        </Button>
      </div>
    </form>
  );
}

"use client";

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea, Input, Label } from '@/components/ui/FormElements';

type KComposerProps = {
  compact?: boolean;
  onSuccessRedirect?: string;
};

export default function KComposer({ compact = false, onSuccessRedirect = '/k' }: KComposerProps) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) {
      setStatus('error');
      setMessage('المحتوى مطلوب.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/k/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), media_url: mediaUrl.trim() || null }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus('error');
        setMessage(payload?.error || 'تعذر نشر المنشور.');
        return;
      }

      setStatus('success');
      window.location.href = onSuccessRedirect;
    } catch {
      setStatus('error');
      setMessage('حدث خطأ غير متوقع.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <Label htmlFor="k-content">ما الجديد؟</Label>
      <Textarea
        id="k-content"
        rows={compact ? 3 : 5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب منشورك القصير هنا..."
        required
        maxLength={500}
      />

      <div>
        <Label htmlFor="k-media">رابط وسائط (اختياري)</Label>
        <Input
          id="k-media"
          type="url"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {message ? <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{content.length}/500</p>
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'جاري النشر...' : 'نشر'}
        </Button>
      </div>
    </form>
  );
}

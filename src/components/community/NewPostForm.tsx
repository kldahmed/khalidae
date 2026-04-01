"use client";

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/FormElements';

export default function NewPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus('error');
        setMessage(payload?.error || 'تعذر حفظ المنشور.');
        return;
      }

      setStatus('success');
      setMessage('تم نشر المنشور بنجاح.');
      setTitle('');
      setContent('');
    } catch {
      setStatus('error');
      setMessage('حدث خطأ غير متوقع.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">العنوان</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="content">المحتوى</Label>
        <Textarea id="content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
      </div>

      {message ? (
        <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>
      ) : null}

      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'جاري النشر...' : 'نشر'}
      </Button>
    </form>
  );
}

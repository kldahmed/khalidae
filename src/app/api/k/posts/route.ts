import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: 'K غير متاح مؤقتًا.' }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const mediaUrl = typeof body.media_url === 'string' ? body.media_url.trim() : null;

  if (!content) {
    return NextResponse.json({ error: 'المحتوى مطلوب.' }, { status: 400 });
  }

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
      username: typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : `user_${user.id.slice(0, 8)}`,
    },
    { onConflict: 'id' },
  );

  const { error } = await supabase.from('k_posts').insert([
    {
      author_id: user.id,
      content,
      media_url: mediaUrl,
      is_published: true,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: 'تعذر نشر المنشور.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

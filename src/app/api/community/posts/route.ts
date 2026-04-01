import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: 'الخدمة غير متاحة مؤقتًا.' }, { status: 503 });
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

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!title || !content) {
    return NextResponse.json({ error: 'العنوان والمحتوى مطلوبان.' }, { status: 400 });
  }

  const { error } = await supabase.from('community_posts').insert([
    {
      author_id: user.id,
      title,
      content,
      is_published: true,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: 'تعذر إنشاء المنشور.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

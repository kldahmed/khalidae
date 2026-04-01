import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function PATCH(req: Request) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: 'الخدمة غير متاحة مؤقتًا.' }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 });
  }

  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : null;
  const username = typeof body.username === 'string' ? body.username.trim() : null;
  const bio = typeof body.bio === 'string' ? body.bio.trim() : null;
  const avatarUrl = typeof body.avatar_url === 'string' ? body.avatar_url.trim() : null;

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        username,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

  if (error) {
    return NextResponse.json({ error: 'تعذر حفظ البيانات.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 });
    }
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('contact_messages').insert([{ name, email, message }]);
    if (error) {
      return NextResponse.json({ error: 'حدث خطأ أثناء الإرسال.' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  }
}

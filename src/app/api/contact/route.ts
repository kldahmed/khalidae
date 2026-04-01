import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة.' }, { status: 400 });
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'بيانات غير صالحة.' }, { status: 400 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = serviceRoleKey && supabaseUrl
      ? createClient(supabaseUrl, serviceRoleKey)
      : createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ success: true, message: 'تم استلام رسالتك.' }, { status: 202 });
    }

    const { error } = await supabase.from('contact_messages').insert([{ name, email, message }]);
    if (error) {
      return NextResponse.json({ success: true, message: 'تم استلام رسالتك.' }, { status: 202 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح.' }, { status: 400 });
  }
}

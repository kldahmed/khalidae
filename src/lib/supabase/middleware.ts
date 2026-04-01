import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function updateSupabaseSession(req: NextRequest, res: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (key) => req.cookies.get(key)?.value,
      set: (key, value, options) => {
        res.cookies.set(key, value, options);
      },
      remove: (key, options) => {
        res.cookies.set(key, '', { ...options, maxAge: -1 });
      },
    },
  });
}

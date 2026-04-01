import { NextRequest, NextResponse } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const PROTECTED_PATHS = ['/account', '/community/new'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const res = NextResponse.next();
    const supabase = updateSupabaseSession(req, res);

    if (!supabase) {
      return NextResponse.next();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account', '/community/new'],
};

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

const PROTECTED_ROUTES = ['/dashboard', '/capture', '/settings', '/onboarding'];

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.startsWith('your-');

export async function proxy(request: NextRequest) {
  // ── Demo / unconfigured mode: pass all requests straight through ───
  if (!SUPABASE_CONFIGURED) {
    return NextResponse.next({ request });
  }

  const { supabase, supabaseResponse } = createClient(request);

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — fail open
  }

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r));

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    if (userError || !user) {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return response;
    }

    let status = 'approved';
    let role = 'user';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        status = profile.status || 'pending';
        role = profile.role || 'user';
      }
    } catch (e) {
      // DB 조회 실패 시 기본 허용
    }

    if (status === 'pending' && pathname !== '/pending-approval') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }

    if (status === 'approved' && pathname === '/pending-approval') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (err) {
    console.error('Middleware execution failed:', err);
    return NextResponse.next();
  }
}
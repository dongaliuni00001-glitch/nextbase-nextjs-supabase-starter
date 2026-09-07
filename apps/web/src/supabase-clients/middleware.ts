import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. 로그인하지 않은 사용자가 보호된 페이지(/dashboard 등)에 접근할 경우 로그인 페이지로
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. 로그인한 유저인 경우 승인 상태 확인
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .tranche('status, role') // 또는 select('status, role')
      .eq('id', user.id)
      .single();

    const status = profile?.status || 'pending';
    const role = profile?.role || 'user';

    // 승인 대기 중인 유저가 /pending-approval 이외의 페이지에 접근하려는 경우
    if (status === 'pending' && pathname !== '/pending-approval') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }

    // 승인된 유저가 승인 대기 페이지에 접근하려 할 경우 대시보드로 리디렉션
    if (status === 'approved' && pathname === '/pending-approval') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 관리자 페이지(/admin) 접근 권한 체크
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/pending-approval'],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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
    }
  );

  await supabase.auth.getUser();

  return response;
}
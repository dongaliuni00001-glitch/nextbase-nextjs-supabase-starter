
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
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 환경 변수가 설정되지 않았습니다.');
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isApiRoute =
      pathname === '/api' || pathname.startsWith('/api/');

    // API 인증과 권한 검사는 각 API Route에서 담당한다.
    // 여기서는 세션 갱신만 하고 페이지용 리다이렉트는 적용하지 않는다.
    if (isApiRoute) {
      return response;
    }

    // 로그인하지 않은 사용자의 보호 페이지 접근 차단
    if (userError || !user) {
      if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin')
      ) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return response;
    }

    // 페이지 접근 정책: 사용자 승인 상태 및 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .maybeSingle();

    // 페이지 권한 확인에 실패하면 접근을 허용하지 않는다.
    if (profileError || !profile) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (
        pathname.startsWith('/dashboard') &&
        pathname !== '/pending-approval'
      ) {
        return NextResponse.redirect(
          new URL('/pending-approval', request.url)
        );
      }

      return response;
    }

    const status = profile.status ?? 'pending';
    const role = profile.role ?? 'user';

    if (status !== 'approved') {
      if (pathname !== '/pending-approval') {
        return NextResponse.redirect(
          new URL('/pending-approval', request.url)
        );
      }

      return response;
    }

    if (pathname === '/pending-approval') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware execution failed:', error);

    // 보호 페이지 접근을 기본 허용하지 않는다.
    const pathname = request.nextUrl.pathname;

    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }
}

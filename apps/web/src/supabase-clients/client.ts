'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient(): ReturnType<typeof createBrowserClient> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/**
 * 기존 기능 코드와의 호환성을 위한 alias.
 *
 * 신규 코드는 createClient() 사용을 권장하지만,
 * 기존 resume 페이지가 createSupabaseClient()를 사용하고 있으므로
 * 당장은 호환성을 유지한다.
 */
export function createSupabaseClient(): ReturnType<
  typeof createBrowserClient
> {
  return createClient();
}
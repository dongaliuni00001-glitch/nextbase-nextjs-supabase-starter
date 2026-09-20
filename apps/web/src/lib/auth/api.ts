import 'server-only';

import { createSupabaseClient } from '@/supabase-clients/server';

export async function requireApiUser() {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    supabase,
    user,
  };
}
import { cache } from 'react';
import { createSupabaseClient } from '@/supabase-clients/server';

export const getCachedLoggedInUserClaims = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await (supabase.auth as any).getClaims?.() || {};
    if (error || !data?.claims) {
      return { sub: null };
    }
    return data.claims;
  } catch {
    return { sub: null };
  }
});

export const getCachedIsUserLoggedIn = cache(async () => {
  try {
    const claims = await getCachedLoggedInUserClaims();
    return claims?.sub !== null && claims?.sub !== undefined;
  } catch {
    return false;
  }
});

export const getCachedLoggedInUserId = cache(async () => {
  try {
    const claims = await getCachedLoggedInUserClaims();
    return claims?.sub ?? null;
  } catch {
    return null;
  }
});

export const getCachedLoggedInSupabaseUser = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return { user: null as any };
    }
    return { user: data.session.user as any };
  } catch {
    return { user: null as any };
  }
});

export const getCachedLoggedInVerifiedSupabaseUser = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { user: null as any };
    }
    return { user: user as any };
  } catch {
    return { user: null as any };
  }
});
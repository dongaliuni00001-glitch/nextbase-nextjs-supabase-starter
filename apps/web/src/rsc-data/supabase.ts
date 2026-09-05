import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';

export const getCachedLoggedInUserClaims = cache(async () => {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { sub: null };
    }
    return { sub: user.id, ...user };
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
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
});
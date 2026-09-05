import { createSupabaseClient } from '@/supabase-clients/server';
import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';

export const getCachedLoggedInUserClaims = cache(async () => {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return { sub: null };
    }
    return { sub: session.user.id, ...session.user };
  } catch {
    return { sub: null };
  }
});

export const getCachedIsUserLoggedIn = cache(async () => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
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

// Only meant to be used in protected pages
// This doesn't verify the token with the server, it only validates the stored token
export const getCachedLoggedInSupabaseUser = cache(async () => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  if (!data.session?.user) {
    throw new Error('No user found');
  }
  return data.session.user;
});

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
  const claims = await getCachedLoggedInUserClaims();
  return claims?.sub !== null && claims?.sub !== undefined;
});

export const getCachedLoggedInUserId = cache(async () => {
  const claims = await getCachedLoggedInUserClaims();
  return claims?.sub ?? null;
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
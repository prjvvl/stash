import { createClient, type Session } from "@supabase/supabase-js";

// Sourced from env, not hardcoded, since this repo is public — see
// .env.example. RLS is the real access boundary, not this key.
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_PUBLISHABLE_KEY — check .env (see .env.example).");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Supabase auth is email-based; usernames are mapped to emails at this fake,
// reserved domain (RFC 2606 .invalid — guaranteed non-routable) so nothing
// ever needs to be deliverable. Must match scripts/manage-user.mjs.
const USERNAME_DOMAIN = "stash.invalid";

export function usernameToEmail(username: string): string {
  return `${username}@${USERNAME_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  return email.endsWith(`@${USERNAME_DOMAIN}`) ? email.slice(0, -(USERNAME_DOMAIN.length + 1)) : email;
}

// No signup/reset here — accounts are provisioned via scripts/manage-user.mjs.
export async function signIn(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

// Fires immediately with any restored session, then on every auth change.
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { emailToUsername, getSession, onAuthStateChange, signOut } from "../lib/supabase";

// Own session subscription — Nav.astro is server-rendered, can't share StashApp's state.
export default function AuthControl() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession().then(({ session }) => setSession(session));
    const subscription = onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session?.user.email) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-fg-muted">{emailToUsername(session.user.email)}</span>
      <button
        onClick={() => signOut()}
        aria-label="Sign out"
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-fg-muted hover:text-fg"
      >
        <LogOut className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

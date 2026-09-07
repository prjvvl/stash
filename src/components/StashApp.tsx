import { useEffect, useState, type SubmitEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSession, onAuthStateChange, signIn } from "../lib/supabase";
import { buttonVariantClass } from "../lib/styles";
import StorageBrowser from "./StorageBrowser";

const inputClass =
  "min-h-11 w-full rounded-card border border-border bg-surface px-4 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none";

export default function StashApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSession().then(({ session }) => {
      setSession(session);
      setCheckingSession(false);
    });
    const subscription = onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(username, password);
    if (error) setError(error.message);
    setSubmitting(false);
  }

  if (checkingSession) return null;

  if (!session) {
    return (
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
          placeholder="Username"
          autoComplete="username"
          required
          className={inputClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={submitting} className={buttonVariantClass.primary}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    );
  }

  return <StorageBrowser />;
}

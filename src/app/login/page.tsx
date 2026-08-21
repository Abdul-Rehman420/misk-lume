"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authErrorDismissed, setAuthErrorDismissed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/account";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/account";
  const authError = searchParams.get("error");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message === "Invalid login credentials" ? "Invalid email or password" : signInError.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('suspended')
          .eq('id', user.id)
          .single();

        if (profile?.suspended) {
          await supabase.auth.signOut();
          setError("Your account has been suspended. Please contact support for assistance.");
          return;
        }
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-72px)] items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-surface p-8">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-0">
            <span className="font-display text-2xl font-semibold text-text-primary">Misk</span>
            <span className="font-display text-2xl font-semibold text-accent-gold">Lume</span>
          </Link>
        </div>

        <h1 className="mb-1 text-center font-display text-2xl font-medium text-text-primary">Welcome Back</h1>
        <p className="mb-8 text-center text-sm text-text-muted">Sign in to your account</p>

        {authError && !authErrorDismissed && (
          <div className="mb-5 flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
            <span>{authError === "suspended" ? "Your account has been suspended. Please contact support for assistance." : "Authentication failed. Please try again."}</span>
            <button type="button" onClick={() => setAuthErrorDismissed(true)} aria-label="Dismiss error" className="ml-3 text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error" className="ml-3 text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={254}
                className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none"
              />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                maxLength={128}
                className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim transition-colors hover:text-text-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-10 py-4 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all duration-200 hover:bg-accent-gold-hover hover:shadow-gold disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent-gold transition-colors hover:text-accent-gold-hover">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100svh-72px)] items-center justify-center bg-bg-primary"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

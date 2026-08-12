"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "bg-text-dim", width: "w-0" };
  if (password.length < 6) return { label: "Weak", color: "bg-error", width: "w-1/4" };
  if (password.length < 10) return { label: "Fair", color: "bg-accent-gold", width: "w-2/4" };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
    return { label: "Strong", color: "bg-success", width: "w-full" };
  return { label: "Good", color: "bg-accent-gold-hover", width: "w-3/4" };
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) { setError("You must agree to the Terms of Service"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone: phone || undefined },
        },
      });
      if (authError) {
        setError(authError.message.includes("already") ? "An account with this email already exists" : authError.message);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100svh-72px)] items-center justify-center bg-bg-primary px-4">
        <div className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-accent-gold"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="font-display text-xl font-medium text-text-primary">Check Your Email</h2>
          <p className="mt-2 text-sm text-text-muted">We sent a confirmation link to <span className="text-text-primary">{email}</span>. Click the link to activate your account.</p>
          <button onClick={() => router.push("/login")} className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all hover:bg-accent-gold-hover">
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100svh-72px)] items-center justify-center bg-bg-primary px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-surface p-8">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-0">
            <span className="font-display text-2xl font-semibold text-text-primary">Misk</span>
            <span className="font-display text-2xl font-semibold text-accent-gold">Lume</span>
          </Link>
        </div>

        <h1 className="mb-1 text-center font-display text-2xl font-medium text-text-primary">Create Account</h1>
        <p className="mb-8 text-center text-sm text-text-muted">Join the Misk Lume ritual</p>

        {error && (
          <div className="mb-5 flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text-primary">Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required maxLength={100} className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none" />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required maxLength={254} className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none" />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-primary">Phone Number <span className="text-text-dim">(optional)</span></label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03001234567" maxLength={15} className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none" />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" required maxLength={128} className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim transition-colors hover:text-text-muted" aria-label={showPassword ? "Hide password" : "Show password"}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2">
                <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className="text-xs text-text-dim">{strength.label}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-text-primary">Confirm Password</label>
            <div className="relative">
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required maxLength={128} className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-dim focus:border-accent-gold focus:outline-none" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim transition-colors hover:text-text-muted" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <label className="flex items-start gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded-sm border-border bg-bg-primary text-accent-gold focus:ring-accent-gold" />
            <span>
              I agree to the <Link href="/terms" className="text-accent-gold transition-colors hover:text-accent-gold-hover">Terms of Service</Link> and <Link href="/privacy" className="text-accent-gold transition-colors hover:text-accent-gold-hover">Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" disabled={loading} className="inline-flex w-full min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-10 py-4 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all duration-200 hover:bg-accent-gold-hover hover:shadow-gold disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-gold transition-colors hover:text-accent-gold-hover">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

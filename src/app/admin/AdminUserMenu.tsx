"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminUserMenu() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data?.full_name) setName(data.full_name);
      }
    })();
  }, [supabase]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const initial = (name || email || "A").charAt(0).toUpperCase();

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ backgroundColor: "var(--color-accent-gold)" }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90"
        aria-label="Account menu"
        aria-expanded={open}
        suppressHydrationWarning
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-md border border-admin-border bg-admin-surface shadow-lg">
          <div className="border-b border-admin-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-admin-text">{name || "Administrator"}</p>
            {email && <p className="truncate text-xs text-admin-text-muted">{email}</p>}
          </div>
          <div className="py-1">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-admin-text transition-colors hover:bg-admin-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              View Store
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-admin-text transition-colors hover:bg-admin-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              My Account
            </Link>
          </div>
          <div className="border-t border-admin-border py-1">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

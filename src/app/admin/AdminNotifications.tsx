"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  type: "review" | "order";
  title: string;
  meta: string;
  href: string;
}

export default function AdminNotifications() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function loadNotifications() {
    try {
      const [reviewsRes, ordersRes] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("orders").select("order_number, created_at, total").eq("status", "pending").order("created_at", { ascending: false }).limit(8),
      ]);

      const next: NotificationItem[] = [];

      if (reviewsRes.count && reviewsRes.count > 0) {
        next.push({
          id: "reviews",
          type: "review",
          title: `${reviewsRes.count} review${reviewsRes.count > 1 ? "s" : ""} awaiting approval`,
          meta: "Moderation needed",
          href: "/admin/reviews",
        });
      }

      (ordersRes.data ?? []).forEach((o) => {
        next.push({
          id: `order-${o.order_number}`,
          type: "order",
          title: `Order ${o.order_number}`,
          meta: `PKR ${(o.total ?? 0).toLocaleString()} · pending`,
          href: "/admin/orders",
        });
      });

      setItems(next);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  const hasUnread = items.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
        aria-label="Notifications"
        aria-expanded={open}
        suppressHydrationWarning
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-admin-border bg-admin-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
            <h3 className="text-sm font-semibold text-admin-text">Notifications</h3>
            <button type="button" onClick={loadNotifications} className="text-xs font-medium text-accent-gold transition-colors hover:text-accent-gold-hover">
              Refresh
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-admin-text-muted">
                You&apos;re all caught up.
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 border-b border-admin-border px-4 py-3 transition-colors hover:bg-admin-bg"
                    >
                      <span className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.type === "review" ? "bg-accent-gold/15 text-accent-gold" : "bg-success/15 text-success"}`}>
                        {item.type === "review" ? "R" : "O"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-admin-text">{item.title}</span>
                        <span className="block text-xs text-admin-text-muted">{item.meta}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

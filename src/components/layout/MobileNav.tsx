"use client";

import { useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Attar", href: "/attar" },
  { label: "Blog", href: "/blog" },
];

const actionLinks = [
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Account", href: "/account" },
];

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    panel.addEventListener("keydown", trap);
    first?.focus();
    return () => panel.removeEventListener("keydown", trap);
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[var(--z-overlay)] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-overlay transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute inset-y-0 left-0 flex w-full flex-col bg-bg-primary transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-[72px] items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-0" onClick={onClose}>
            <span className="font-display text-2xl font-semibold text-text-primary">
              Misk
            </span>
            <span className="font-display text-2xl font-semibold text-accent-gold">
              Lume
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center"
          >
            <CloseIcon className="h-6 w-6 text-text-primary" />
          </button>
        </div>

        {/* Links */}
        <nav aria-label="Mobile navigation" className="flex flex-1 flex-col items-center justify-center gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-display text-3xl font-medium text-text-primary transition-colors hover:text-accent-gold"
              style={{
                transitionDelay: open ? `${i * 50}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.3s ease, transform 0.3s ease, color 0.15s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action links */}
        <div className="flex items-center justify-center gap-6 border-t border-border px-4 pb-8 pt-6">
          {actionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-xs font-semibold uppercase tracking-wider text-text-muted transition-colors hover:text-accent-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

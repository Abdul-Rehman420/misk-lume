"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setQuery("");
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>("input, button, [href]");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[var(--z-overlay)] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search fragrances"
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-overlay transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`absolute inset-x-0 top-0 transition-transform duration-300 ease-in-out ${open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="mx-auto max-w-3xl px-4 pt-24 pb-12">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances..."
              aria-label="Search fragrances"
              className="w-full border-b-2 border-border bg-transparent py-4 pr-12 text-lg text-text-primary placeholder-text-dim transition-colors focus:border-accent-gold focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-text-muted transition-colors hover:text-accent-gold"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Oud", "Rose", "Saffron", "Musk", "Jasmine"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  router.push(`/shop?search=${encodeURIComponent(term)}`);
                  onClose();
                }}
                className="rounded-full border border-border px-4 py-2 text-xs text-text-muted transition-colors hover:border-accent-gold hover:text-accent-gold"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

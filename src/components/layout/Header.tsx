"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MobileNav from "./MobileNav";
import SearchModal from "./SearchModal";
import { useCart } from "@/lib/context/CartContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Attar", href: "/attar" },
  { label: "Blog", href: "/blog" },
];

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
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
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
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
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.span
      className="group relative inline-block"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <Link
        href={href}
        className="text-sm font-medium uppercase tracking-wider text-text-primary transition-colors hover:text-accent-gold"
      >
        {label}
      </Link>
      <motion.span
        className="absolute -bottom-1 left-0 h-px bg-accent-gold"
        variants={{
          rest: { width: 0 },
          hover: { width: "100%", transition: { duration: 0.3, ease: "easeOut" } },
        }}
      />
    </motion.span>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount: cartCount } = useCart();

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[var(--z-sticky)] border-b border-border"
        style={{
          height: 72,
          background: "rgba(11, 11, 11, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="flex items-center justify-center lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-6 w-6 text-text-primary" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-0">
            <span className="font-display text-2xl font-semibold text-text-primary">
              Misk
            </span>
            <span className="font-display text-2xl font-semibold text-accent-gold">
              Lume
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              className="hidden items-center justify-center sm:flex"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="h-5 w-5 text-text-primary transition-colors hover:text-accent-gold" />
            </button>

            <Link
              href="/account"
              className="hidden items-center justify-center sm:flex"
              aria-label="Account"
            >
              <UserIcon className="h-5 w-5 text-text-primary transition-colors hover:text-accent-gold" />
            </Link>

            <Link
              href="/wishlist"
              className="hidden items-center justify-center sm:flex"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-5 w-5 text-text-primary transition-colors hover:text-accent-gold" />
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center justify-center"
              aria-label="Cart"
            >
              <BagIcon className="h-5 w-5 text-text-primary transition-colors hover:text-accent-gold" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-gold text-[10px] font-semibold text-bg-primary">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[72px]" />

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

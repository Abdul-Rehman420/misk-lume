import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Misk Lume",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 text-center">
      <span className="text-8xl font-bold text-accent-gold/20">404</span>
      <h1 className="mt-4 font-display text-3xl font-medium text-text-primary">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-sm text-text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/"><Button variant="primary">Back to Home</Button></Link>
        <Link href="/shop"><Button variant="outline">Browse Shop</Button></Link>
      </div>
    </div>
  );
}

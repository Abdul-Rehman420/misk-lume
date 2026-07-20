"use client";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 text-center">
      <h1 className="font-display text-2xl font-medium text-text-primary">Failed to load products</h1>
      <p className="mt-4 text-text-muted">{error.message || "Something went wrong while loading the shop."}</p>
      <button
        onClick={reset}
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all duration-200 hover:bg-accent-gold-hover"
      >
        Try Again
      </button>
    </div>
  );
}

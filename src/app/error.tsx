"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-medium text-text-primary">Something went wrong</h1>
      <p className="mt-4 max-w-md text-text-muted">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all duration-200 hover:bg-accent-gold-hover"
      >
        Try Again
      </button>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="h-8 w-48 animate-pulse rounded-sm bg-bg-surface" />
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-border bg-bg-surface">
            <div className="aspect-square animate-pulse bg-bg-elevated" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded-sm bg-bg-elevated" />
              <div className="h-3 w-1/2 animate-pulse rounded-sm bg-bg-elevated" />
              <div className="h-4 w-1/3 animate-pulse rounded-sm bg-bg-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

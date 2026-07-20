export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-md bg-bg-surface" />
        <div className="space-y-6">
          <div className="h-4 w-24 animate-pulse rounded-sm bg-bg-surface" />
          <div className="h-10 w-3/4 animate-pulse rounded-sm bg-bg-surface" />
          <div className="h-6 w-1/3 animate-pulse rounded-sm bg-bg-surface" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-sm bg-bg-surface" />
            <div className="h-4 w-5/6 animate-pulse rounded-sm bg-bg-surface" />
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-32 animate-pulse rounded-sm bg-bg-surface" />
            <div className="h-12 w-32 animate-pulse rounded-sm bg-bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

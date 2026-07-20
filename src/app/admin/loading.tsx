export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-sm bg-bg-surface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-bg-surface" />
        ))}
      </div>
      <div className="mt-8 h-96 animate-pulse rounded-md bg-bg-surface" />
    </div>
  );
}

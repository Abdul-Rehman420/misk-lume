interface ReviewCardProps {
  rating: number;
  text: string;
  author: string;
  date: string;
}

export default function ReviewCard({
  rating,
  text,
  author,
  date,
}: ReviewCardProps) {
  return (
    <div className="rounded-md border border-accent-gold/5 bg-bg-surface/70 p-6 backdrop-blur-md">
      {/* Stars */}
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={i < rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={`h-4 w-4 ${i < rating ? "text-accent-gold" : "text-text-dim"}`}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>

      {/* Text */}
      <p className="mt-4 text-sm italic leading-relaxed text-text-muted">
        &ldquo;{text}&rdquo;
      </p>

      {/* Author & date */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          {author}
        </span>
        <span className="text-xs text-text-dim">{date}</span>
      </div>
    </div>
  );
}

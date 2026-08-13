import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

interface FeaturedCardProps {
  label: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  originalPrice?: string;
  href: string;
  reverse?: boolean;
  children?: React.ReactNode;
}

export default function FeaturedCard({
  label,
  name,
  description,
  price,
  imageUrl,
  originalPrice,
  href,
  reverse = false,
  children,
}: FeaturedCardProps) {
  return (
    <div
      className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${reverse ? "direction-rtl" : ""}`}
    >
      {/* Image */}
      <Link
        href={href}
        className={`relative block aspect-[4/5] overflow-hidden rounded-md bg-bg-elevated ${reverse ? "direction-ltr" : ""}`}
        aria-label={name}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className={`flex flex-col gap-4 ${reverse ? "direction-ltr text-left" : ""}`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
          {label}
        </span>
        <Link href={href}>
          <h3 className="font-display text-2xl font-medium text-text-primary transition-colors hover:text-accent-gold">
            {name}
          </h3>
        </Link>
        <p className="max-w-md text-sm leading-relaxed text-text-muted">
          {description}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-accent-gold">{price}</span>
          {originalPrice && (
            <span className="text-sm text-text-dim line-through">
              {originalPrice}
            </span>
          )}
        </div>
        {children ?? (
          <div className="mt-2">
            <Link href={href}>
              <Button variant="outline" size="md">
                Shop Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

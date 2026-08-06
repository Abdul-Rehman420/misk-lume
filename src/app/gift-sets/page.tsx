import Link from "next/link";
import type { Metadata } from "next";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Gift Sets | Misk Lume",
  description: "Curated fragrance collections, beautifully packaged for gifting.",
};

export default function GiftSetsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-medium text-text-primary">Gift Sets</h1>
        <p className="mt-2 text-sm text-text-muted">Curated fragrance collections, beautifully packaged for gifting.</p>
        <div className="mt-12 rounded-md border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted">Our gift sets are coming soon. Stay tuned for beautifully curated fragrance collections.</p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button variant="primary">Browse Collection</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

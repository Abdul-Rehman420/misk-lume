import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-medium text-text-primary">Our Commitment to <span className="italic text-accent-gold">Sustainability</span></h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          At Misk Lume, we believe luxury and responsibility can coexist. Our commitment to sustainability is woven into every aspect of our craft.
        </p>

        <div className="mt-12 space-y-12">
          <div>
            <h2 className="font-display text-xl font-medium text-text-primary">Ethical Sourcing</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              We partner directly with communities that harvest natural ingredients, ensuring fair wages and sustainable practices. Our oud is sourced from plantations that practice responsible agarwood cultivation.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-medium text-text-primary">Conscious Packaging</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              Our bottles are crafted from recyclable glass, and our packaging uses FSC-certified materials with soy-based inks. We are actively working to eliminate all single-use plastics from our supply chain.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-medium text-text-primary">Small Batch Philosophy</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              By producing in limited quantities, we minimize waste and ensure every bottle meets our exacting standards. No overproduction, no excess inventory — just pure, intentional craft.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/shop">
            <Button variant="primary">Explore Our Collection</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

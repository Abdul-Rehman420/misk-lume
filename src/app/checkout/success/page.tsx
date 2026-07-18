import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-bg-surface p-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-500">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Order Placed!</h1>
        <p className="mt-3 text-sm text-text-muted">
          Thank you for your purchase. We&apos;ll send you an email with your order details and tracking information.
        </p>
        <p className="mt-2 text-xs text-text-dim">
          Expected delivery: 4-5 business days
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/shop">
            <Button variant="primary" fullWidth>Continue Shopping</Button>
          </Link>
          <Link href="/account">
            <Button variant="outline" fullWidth>View Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

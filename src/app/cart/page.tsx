"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCart } from "@/lib/context/CartContext";

const SHIPPING_COST = 200;

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + SHIPPING_COST - discount;

  function applyDiscount() {
    if (discountCode.toUpperCase() === "MISK10") {
      setDiscount(Math.round(subtotal * 0.1));
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="mb-10 font-display text-3xl font-medium text-text-primary">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {items.length === 0 ? (
              <div className="rounded-md border border-border bg-bg-surface p-12 text-center">
                <p className="text-text-muted">Your cart is empty</p>
                <Link href="/shop" className="mt-4 inline-block">
                  <Button variant="outline">Browse Collection</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-0">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 border-b border-border py-6"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-bg-surface">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.name.toLowerCase().replace(/ /g, "-")}`}
                        className="font-display text-base font-medium text-text-primary transition-colors hover:text-accent-gold"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-text-dim">
                        {item.size} &mdash; {item.gender}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent-gold">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-l-sm border border-border text-text-muted transition-colors hover:border-accent-gold hover:text-accent-gold"
                      >
                        &minus;
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-y border-border bg-bg-surface text-sm text-text-primary" aria-label={`Quantity: ${item.quantity}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-r-sm border border-border text-text-muted transition-colors hover:border-accent-gold hover:text-accent-gold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-error transition-colors hover:text-error/80"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-gold"
              >
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-md border border-border bg-bg-surface p-6">
              <h2 className="mb-6 font-display text-lg font-medium text-text-primary">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  <span>PKR {SHIPPING_COST.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold text-accent-gold">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-accent-gold"
                />
                <button
                  onClick={applyDiscount}
                  className="rounded-sm border border-accent-gold px-4 py-3 text-xs font-semibold uppercase tracking-wider text-accent-gold transition-colors hover:bg-accent-gold hover:text-bg-primary"
                >
                  Apply
                </button>
              </div>

              <div className="mt-6">
                <Link href="/checkout">
                  <Button variant="primary" fullWidth>
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-xs text-text-dim">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-4 w-4 text-accent-gold"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-dim">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-4 w-4 text-accent-gold"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

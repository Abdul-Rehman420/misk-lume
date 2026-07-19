"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "@/lib/context/CartContext";

const SHIPPING_COST = 200;
const FREE_SHIPPING_THRESHOLD = 8000;

const provinces = [
  "Punjab", "Sindh", "KPK", "Balochistan",
  "Islamabad Capital Territory", "Azad Kashmir", "Gilgit-Baltistan",
];

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", description: "Pay when you receive your order" },
  { id: "bank", label: "Bank Transfer", description: "Transfer to our Meezan Bank account" },
];

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", address: "", province: "", postalCode: "",
    deliveryInstructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || !/^03\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Valid Pakistani phone required (03XXXXXXXXX)";
    if (!form.city.trim()) e.city = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.province) e.province = "Required";
    if (!form.postalCode.trim()) e.postalCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (items.length === 0) { setError("Your cart is empty"); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ product_id: item.id.split("-")[0], size_ml: parseInt(item.size) || null, quantity: item.quantity, price: item.price })),
          shipping_address: { name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, phone: form.phone, city: form.city, address: form.address, province: form.province, postalCode: form.postalCode, instructions: form.deliveryInstructions },
          payment_method: paymentMethod,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }
      clearCart();
      router.push("/checkout/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function input(field: string, label: string, type = "text", placeholder = "") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
        <input
          type={type}
          value={(form as Record<string, string>)[field] || ""}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-sm border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-accent-gold ${errors[field] ? "border-red-500" : "border-border"}`}
        />
        {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <h1 className="mb-10 font-display text-3xl font-medium text-text-primary">Checkout</h1>
          <div className="rounded-md border border-border bg-bg-surface p-12 text-center">
            <p className="text-text-muted">Your cart is empty</p>
            <Link href="/shop" className="mt-4 inline-block">
              <Button variant="outline">Browse Collection</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="mb-10 font-display text-3xl font-medium text-text-primary">Checkout</h1>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-md border border-border p-6">
              <h2 className="mb-6 font-display text-lg font-medium text-text-primary">Shipping Information</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {input("firstName", "First Name", "text", "Muhammad")}
                  {input("lastName", "Last Name", "text", "Ali")}
                </div>
                {input("email", "Email", "email", "muhammad@example.com")}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {input("phone", "Phone", "tel", "03001234567")}
                  {input("city", "City", "text", "Lahore")}
                </div>
                {input("address", "Address", "text", "House #123, Street 4, Block B")}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Province</label>
                    <select
                      value={form.province}
                      onChange={(e) => update("province", e.target.value)}
                      className={`w-full rounded-sm border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold ${errors.province ? "border-red-500" : "border-border"}`}
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                  </div>
                  {input("postalCode", "Postal Code", "text", "54000")}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border p-6">
              <h2 className="mb-6 font-display text-lg font-medium text-text-primary">Delivery Instructions</h2>
              <textarea
                rows={3}
                value={form.deliveryInstructions}
                onChange={(e) => update("deliveryInstructions", e.target.value)}
                placeholder="e.g. Leave at the front gate, call before delivery..."
                className="w-full resize-none rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-dim focus:border-accent-gold"
              />
            </div>

            <div className="rounded-md border border-border p-6">
              <h2 className="mb-6 font-display text-lg font-medium text-text-primary">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-all duration-200 ${paymentMethod === method.id ? "border-accent-gold bg-accent-gold/5" : "border-border hover:border-border"}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                    <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === method.id ? "border-accent-gold" : "border-text-dim"}`}>
                      {paymentMethod === method.id && <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{method.label}</p>
                      <p className="text-xs text-text-dim">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "bank" && (
                <div className="mt-6 rounded-md border border-border bg-bg-surface p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-gold">Bank Transfer Details</p>
                  <div className="space-y-2 text-sm text-text-muted">
                    <div className="flex justify-between"><span>Bank</span><span className="text-text-primary">Meezan Bank</span></div>
                    <div className="flex justify-between"><span>Account Title</span><span className="text-text-primary">Misk Lume (Pvt) Ltd</span></div>
                    <div className="flex justify-between"><span>Account No</span><span className="text-text-primary">0123-0101-2345678-01</span></div>
                    <div className="flex justify-between"><span>IBAN</span><span className="text-text-primary">PK90MEZN0001230101234567801</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Placing Order..." : `Place Order — PKR ${total.toLocaleString()}`}
              </Button>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-md border border-border bg-bg-surface p-6">
              <h2 className="mb-6 font-display text-lg font-medium text-text-primary">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-bg-elevated">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-dim">{item.size} &times; {item.quantity}</p>
                    </div>
                    <p className="text-sm text-text-muted">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
                {shipping > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="rounded-sm bg-accent-gold/10 px-3 py-2 text-xs text-accent-gold">
                    Add PKR {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-text-muted"><span>Shipping</span><span>{shipping === 0 ? <span className="text-accent-gold font-medium">FREE</span> : `PKR ${shipping.toLocaleString()}`}</span></div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-base font-bold text-accent-gold"><span>Total</span><span>PKR {total.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="hidden lg:block mt-6">
                <Button variant="primary" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Placing Order..." : `Place Order — PKR ${total.toLocaleString()}`}
                </Button>
              </div>
              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-xs text-text-dim">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 text-accent-gold"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-dim">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 text-accent-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
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

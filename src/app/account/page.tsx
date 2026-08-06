"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

interface OrderItem {
  product_name: string;
  product_image: string;
  quantity: number;
  size_ml: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

interface WishlistItem {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    gender: string;
    image_url: string;
    rating?: number;
    review_count?: number;
    categories?: { name: string; slug: string };
  };
}

const navItems = [
  { label: "Overview", id: "overview", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { label: "Orders", id: "orders", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg> },
  { label: "Wishlist", id: "wishlist", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
];

const statusStyles: Record<string, string> = {
  processing: "bg-accent-gold/20 text-accent-gold",
  pending: "bg-accent-gold/20 text-accent-gold",
  shipped: "bg-blue-500/20 text-blue-400",
  delivered: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function AccountPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login?redirect=/account";
          return;
        }
        setUserId(user.id);

        const [profileRes, ordersRes, wishlistRes] = await Promise.all([
          supabase.from('profiles').select('full_name, email, role').eq('id', user.id).single(),
          supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('wishlist').select('products(id, name, slug, price, sale_price, gender, image_url, rating, review_count, categories(name, slug))').eq('user_id', user.id),
        ]);

        if (profileRes.data) setProfile(profileRes.data as UserProfile);
        if (ordersRes.data) setOrders(ordersRes.data as Order[]);
        if (wishlistRes.data) setWishlist(wishlistRes.data as unknown as WishlistItem[]);
      } catch {
        // Silently fail — will show demo data below
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const displayName = profile?.full_name?.split(" ")[0] || "Guest";

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav aria-label="Account navigation" className="sticky top-24 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors ${
                    activeTab === item.id
                      ? "bg-accent-gold-muted text-accent-gold"
                      : "text-text-muted hover:bg-bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="my-4 h-px bg-border" />
              {profile?.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-text-muted transition-colors hover:bg-bg-surface-hover hover:text-text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M9 3v18" />
                  </svg>
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
                className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-3">
            <h1 className="font-display text-3xl font-medium text-text-primary">
              Welcome back, <span className="text-accent-gold">{displayName}</span>
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Manage your orders, wishlist, and account settings.
            </p>

            {/* Stat Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-bg-surface p-6 text-center">
                <p className="text-3xl font-semibold text-accent-gold">{orders.length}</p>
                <p className="mt-1 text-sm text-text-muted">Total Orders</p>
              </div>
              <div className="rounded-md border border-border bg-bg-surface p-6 text-center">
                <p className="text-3xl font-semibold text-accent-gold">{wishlist.length}</p>
                <p className="mt-1 text-sm text-text-muted">Wishlist Items</p>
              </div>
            </div>

            {/* Orders */}
            {(activeTab === "overview" || activeTab === "orders") && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-medium text-text-primary">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="mt-4 rounded-md border border-border bg-bg-surface p-12 text-center">
                    <p className="text-text-muted">No orders yet</p>
                    <Link href="/shop" className="mt-4 inline-block">
                      <Button variant="outline">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-md border border-border bg-bg-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-text-primary">{order.order_number || order.id}</span>
                            <span className="text-xs text-text-dim">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[order.status] || "bg-bg-elevated text-text-muted"}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          {order.order_items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-md bg-bg-elevated">
                                <Image src={item.product_image} alt={item.product_name} width={48} height={48} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm text-text-primary">{item.product_name}</p>
                                {item.quantity > 1 && <p className="text-xs text-text-dim">Qty: {item.quantity}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                          <span className="text-sm text-text-muted">Total</span>
                          <span className="text-sm font-semibold text-accent-gold">PKR {order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {(activeTab === "overview" || activeTab === "wishlist") && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-medium text-text-primary">Your Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="mt-4 rounded-md border border-border bg-bg-surface p-12 text-center">
                    <p className="text-text-muted">Your wishlist is empty</p>
                    <Link href="/shop" className="mt-4 inline-block">
                      <Button variant="outline">Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <ProductCard
                        key={item.products.slug}
                        productId={item.products.id}
                        name={item.products.name}
                        slug={item.products.slug}
                        price={item.products.price}
                        salePrice={item.products.sale_price}
                        gender={item.products.gender}
                        imageUrl={item.products.image_url}
                        rating={item.products.rating}
                        reviewCount={item.products.review_count}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

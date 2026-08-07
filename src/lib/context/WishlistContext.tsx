"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface WishlistContextValue {
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  isBusy: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue>({
  isSaved: () => false,
  toggle: async () => {},
  isBusy: () => false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        const { data } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id);
        if (!cancelled && data) {
          setSaved(new Set(data.map((row) => row.product_id)));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isSaved = useCallback((productId: string) => saved.has(productId), [saved]);

  const isBusy = useCallback((productId: string) => busyIds.has(productId), [busyIds]);

  const toggle = useCallback(
    async (productId: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      setBusyIds((prev) => new Set(prev).add(productId));

      if (saved.has(productId)) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (!error) {
          setSaved((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, product_id: productId });
        if (!error) {
          setSaved((prev) => new Set(prev).add(productId));
        }
      }

      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    },
    [saved]
  );

  const value = useMemo(() => ({ isSaved, toggle, isBusy }), [isSaved, toggle, isBusy]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}

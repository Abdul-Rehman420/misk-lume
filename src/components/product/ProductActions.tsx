"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";

interface ProductSize {
  size_ml: number;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface ProductActionsProps {
  productId: string;
  name: string;
  slug: string;
  gender: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  images: ProductImage[];
  sizes: ProductSize[];
  stockQuantity: number;
}

export default function ProductActions({
  productId, name, slug, gender, price, salePrice, imageUrl, images, sizes, stockQuantity,
}: ProductActionsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    sizes.length > 0 ? sizes.find((s) => s.stock_quantity > 0) || sizes[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const allImages = images.length > 0 ? images : [{ image_url: imageUrl, is_primary: true }];
  const displayPrice = selectedSize?.sale_price || selectedSize?.price || salePrice || price;
  const selectedStock = selectedSize?.stock_quantity ?? stockQuantity;

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${productId}-${selectedSize?.size_ml || "default"}`,
        name,
        slug,
        size: selectedSize ? `${selectedSize.size_ml}ml` : "Standard",
        gender,
        price: displayPrice,
        imageUrl: allImages[selectedImage]?.image_url || imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square overflow-hidden rounded-md bg-bg-surface">
          <Image
            src={allImages[selectedImage]?.image_url || imageUrl}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        {allImages.length > 1 && (
          <div className="flex gap-3">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-20 w-20 overflow-hidden rounded-sm border transition-all duration-200 ${
                  i === selectedImage
                    ? "border-accent-gold ring-1 ring-accent-gold/30"
                    : "border-border-subtle hover:border-border"
                }`}
              >
                <div className="relative h-full w-full bg-bg-elevated">
                  <Image src={img.image_url} alt={`${name} thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size selector + Price + Add to Cart */}
      <div className="flex flex-col gap-6 lg:py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">{gender}</p>
          <h1 className="mt-2 font-display text-3xl font-medium text-text-primary">{name}</h1>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-accent-gold">PKR {displayPrice.toLocaleString()}</span>
          {selectedSize?.sale_price && selectedSize.sale_price < selectedSize.price && (
            <span className="text-sm text-text-dim line-through">PKR {selectedSize.price.toLocaleString()}</span>
          )}
          {!selectedSize && salePrice && salePrice < price && (
            <span className="text-sm text-text-dim line-through">PKR {price.toLocaleString()}</span>
          )}
        </div>

        {sizes.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Size</p>
            <div className="flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size.size_ml}
                  onClick={() => size.stock_quantity > 0 && setSelectedSize(size)}
                  disabled={size.stock_quantity === 0}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedSize?.size_ml === size.size_ml
                      ? "border-accent-gold bg-accent-gold text-bg-primary"
                      : size.stock_quantity === 0
                        ? "cursor-not-allowed border-border-subtle text-text-dim/50 line-through"
                        : "border-border text-text-muted hover:border-accent-gold hover:text-text-primary"
                  }`}
                >
                  {size.size_ml}ml
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${selectedStock > 0 ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-text-muted">
            {selectedStock > 0 ? `In Stock — Only ${selectedStock} left in this batch` : "Out of Stock"}
          </span>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-primary">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-text-muted transition-colors hover:border-accent-gold hover:text-text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(selectedStock, q + 1))}
              disabled={quantity >= selectedStock}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-text-muted transition-colors hover:border-accent-gold hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={selectedStock === 0}
            className={`inline-flex flex-1 items-center justify-center rounded-sm px-10 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
              added
                ? "bg-green-600 text-white"
                : selectedStock === 0
                  ? "cursor-not-allowed bg-bg-elevated text-text-dim"
                  : "bg-accent-gold text-bg-primary hover:bg-accent-gold-hover hover:shadow-gold"
            }`}
          >
            {added ? "Added!" : "Add to Cart"}
          </button>
          <button
            aria-label="Add to wishlist"
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-sm border border-border text-text-muted transition-all duration-200 hover:border-accent-gold hover:text-accent-gold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

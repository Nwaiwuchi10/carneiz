"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import { productService } from '@/src/services/product.service';
import { useCart } from '@/src/context/CartContext';

interface ProductItem {
  _id: string;
  name: string;
  weight: string;
  price: string;
  rawPrice: number;
  rating: number;
  image: string;
}

const fallbackBestSellers: ProductItem[] = [
  {
    _id: 'd1',
    name: 'Beef Cut',
    weight: '1.0 kg',
    price: '₦9,800',
    rawPrice: 9800,
    rating: 5,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314241/carneiz_products/f0fr61oztrrpbycs2fs5.png',
  },
  {
    _id: 'd2',
    name: 'Star Maggi Cubes',
    weight: '400 g',
    price: '₦2,000',
    rawPrice: 2000,
    rating: 5,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314285/carneiz_products/pd9olgmrlurdsemlzinj.jpg',
  },
  {
    _id: 'd3',
    name: 'Ducros Curry Cup',
    weight: '25 g',
    price: '₦1,050',
    rawPrice: 1050,
    rating: 5,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314238/carneiz_products/t3vxiqq4iigj7jbx9zmv.png',
  },
];

const fallbackNewArrivals: ProductItem[] = [
  {
    _id: 'd4',
    name: 'Goat Leg',
    weight: '1.0 kg',
    price: '₦6,500',
    rawPrice: 6500,
    rating: 4,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314261/carneiz_products/ic3pbqv9lx4co8braybl.png',
  },
  {
    _id: 'd5',
    name: 'Catfish',
    weight: '1.0 kg',
    price: '₦6,150',
    rawPrice: 6150,
    rating: 4,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314281/carneiz_products/nqaw31mlrt5sjnts081v.jpg',
  },
  {
    _id: 'd6',
    name: 'Goatmeat',
    weight: '1.0 kg',
    price: '₦9,970',
    rawPrice: 9970,
    rating: 5,
    image: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314273/carneiz_products/jtkbjy8pr5k7rlrzgbi0.jpg',
  },
];

function mapProduct(p: any): ProductItem {
  const rawPrice = Number(p.price) || 0;
  return {
    _id: p._id || '',
    name: p.name || 'Product',
    weight: p.weight || '1.0 kg',
    price: `₦${rawPrice.toLocaleString()}`,
    rawPrice,
    rating: Math.min(5, Math.max(1, Math.round(Number(p.rating) || 5))),
    image: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '/assets/images/placeholder.jpg',
  };
}

function ProductList({
  title,
  products,
  onAddToCart,
  loading,
}: {
  title: string;
  products: ProductItem[];
  onAddToCart?: (item: ProductItem) => void;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <h3 className="m-0 text-gray-900 text-xl font-bold">{title}</h3>
        <Link
          href="/products"
          className="text-[#8B1919] font-bold text-xs tracking-wider no-underline hover:underline flex items-center gap-1 group/link"
        >
          <span>VIEW ALL</span>
          <span className="group-hover/link:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div className="w-16 h-8 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">No products available.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {products.slice(0, 3).map((p, i) => (
            <div key={p._id || i} className="flex gap-4 items-center group">
              <Link
                href={`/products/${p._id}`}
                className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 p-2 block group-hover:border-red-100 transition-colors"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${p._id}`} className="no-underline text-inherit block">
                  <h4 className="m-0 text-gray-800 text-base font-semibold mb-1 group-hover:text-[#8B1919] transition-colors truncate">
                    {p.name}
                  </h4>
                </Link>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mb-1">
                  {p.weight}
                </span>
                <div className="flex gap-[2px]">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <span
                        key={j}
                        className={j < p.rating ? 'text-amber-400 text-xs' : 'text-gray-200 text-xs'}
                      >
                        ★
                      </span>
                    ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="font-bold text-gray-900 text-lg">{p.price}</span>
                <button
                  onClick={() => onAddToCart && onAddToCart(p)}
                  className="bg-gray-50 hover:bg-[#8B1919] hover:text-white border border-gray-200 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-sm"
                  title="Add to cart"
                  aria-label="Add to cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState<ProductItem[]>(fallbackBestSellers);
  const [newArrivals, setNewArrivals] = useState<ProductItem[]>(fallbackNewArrivals);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicProducts() {
      try {
        const res = await productService.getProducts({ limit: 50 });
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const all: any[] = res.data;

          // 1. Best Sellers: sort by popularity (reviews count desc, rating desc)
          const sortedForBest = [...all].sort((a, b) => {
            const rDiff = (Number(b.numReviews) || 0) - (Number(a.numReviews) || 0);
            if (rDiff !== 0) return rDiff;
            return (Number(b.rating) || 5) - (Number(a.rating) || 5);
          });
          const best3 = sortedForBest.slice(0, 3).map(mapProduct);

          // 2. New Arrivals: sort by newest createdAt, avoiding best sellers duplicate if possible
          const sortedForNew = [...all].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          const newCandidates = sortedForNew.filter((p) => !best3.some((b) => b._id === p._id));
          const new3 = (newCandidates.length >= 3 ? newCandidates.slice(0, 3) : sortedForNew.slice(0, 3)).map(mapProduct);

          setBestSellers(best3);
          setNewArrivals(new3);
        }
      } catch (err) {
        console.error('Failed to load dynamic products for BestSellers/NewArrivals:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDynamicProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item: ProductItem) => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.rawPrice || 0,
      weight: item.weight,
      quantity: 1,
      imageUrl: item.image,
    });
    setCartNotification(`Added ${item.name} to cart!`);
    setTimeout(() => setCartNotification(null), 2500);
  };

  return (
    <section className="py-8 md:py-16 px-4 md:px-[5%] bg-[#fcfcfc] relative">
      {/* Toast Notification */}
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B1919] text-white px-4 py-2.5 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{cartNotification}</span>
        </div>
      )}

      {/* Mobile Lists (Stacked) */}
      <div className="flex flex-col gap-8 md:hidden">
        {/* Mobile Best Sellers */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="m-0 text-gray-900 text-base font-bold">Best Sellers</h3>
            <Link
              href="/products"
              className="text-[#D97706] font-bold text-xs uppercase tracking-wider no-underline flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {bestSellers.slice(0, 3).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm flex items-center gap-3.5 justify-between"
                >
                  <Link
                    href={`/products/${item._id}`}
                    className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1 block border border-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item._id}`} className="no-underline text-inherit block">
                      <h4 className="m-0 text-gray-900 text-sm font-bold truncate">{item.name}</h4>
                    </Link>
                    <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                      {item.weight}
                    </span>
                    <div className="flex text-amber-500 text-[10px] mt-0.5">
                      {'★'.repeat(item.rating)}
                      {'☆'.repeat(Math.max(0, 5 - item.rating))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-sm text-[#D97706] mb-1.5">{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-8 h-8 rounded-lg bg-[#8B1919] hover:bg-[#6b1010] active:scale-95 text-white flex items-center justify-center shadow-sm border-none cursor-pointer transition-transform"
                      title="Add to cart"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile New Arrivals */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="m-0 text-gray-900 text-base font-bold">New Arrivals</h3>
            <Link
              href="/products"
              className="text-[#D97706] font-bold text-xs uppercase tracking-wider no-underline flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {newArrivals.slice(0, 3).map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm flex items-center gap-3.5 justify-between"
                >
                  <Link
                    href={`/products/${item._id}`}
                    className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1 block border border-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item._id}`} className="no-underline text-inherit block">
                      <h4 className="m-0 text-gray-900 text-sm font-bold truncate">{item.name}</h4>
                    </Link>
                    <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
                      {item.weight}
                    </span>
                    <div className="flex text-amber-500 text-[10px] mt-0.5">
                      {'★'.repeat(item.rating)}
                      {'☆'.repeat(Math.max(0, 5 - item.rating))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-sm text-[#D97706] mb-1.5">{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-8 h-8 rounded-lg bg-[#8B1919] hover:bg-[#6b1010] active:scale-95 text-white flex items-center justify-center shadow-sm border-none cursor-pointer transition-transform"
                      title="Add to cart"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex flex-col lg:flex-row gap-8">
        <ProductList
          title="Best Sellers"
          products={bestSellers}
          onAddToCart={handleAddToCart}
          loading={loading}
        />
        <ProductList
          title="New Arrivals"
          products={newArrivals}
          onAddToCart={handleAddToCart}
          loading={loading}
        />
      </div>
    </section>
  );
}
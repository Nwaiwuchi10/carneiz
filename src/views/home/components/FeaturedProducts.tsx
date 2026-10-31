"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { productService } from '@/src/services/product.service';
import { useCart } from '@/src/context/CartContext';

interface ProductItem {
  _id: string;
  name: string;
  weight: string;
  price: number;
  rating?: number;
  imageUrl?: string;
  inStock?: boolean;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartNotification, setCartNotification] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const res = await productService.getProducts({ limit: 8 });
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setProducts(res.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeatured();
    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product._id);
    setTimeout(() => {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        weight: product.weight || '1.0 kg',
        quantity: 1,
        imageUrl: product.imageUrl || '/assets/images/placeholder.jpg',
      });
      setAddingId(null);
      setCartNotification(`Added ${product.name} to cart!`);
      setTimeout(() => setCartNotification(null), 2500);
    }, 300);
  };

  const handleAddToCompare = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const existing = JSON.parse(localStorage.getItem('carneiz_compare') || '[]');
      if (!existing.some((p: any) => p._id === product._id)) {
        existing.push(product);
        localStorage.setItem('carneiz_compare', JSON.stringify(existing.slice(0, 4)));
        setCartNotification(`Added ${product.name} to Compare list!`);
      } else {
        setCartNotification(`${product.name} is already in Compare list!`);
      }
    } catch {
      setCartNotification(`Added ${product.name} to Compare list!`);
    }
    setTimeout(() => setCartNotification(null), 2500);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let wishlist = JSON.parse(localStorage.getItem('carneiz_wishlist') || '[]');
      const exists = wishlist.some((p: any) => p._id === product._id);
      if (exists) {
        wishlist = wishlist.filter((p: any) => p._id !== product._id);
        setCartNotification(`Removed ${product.name} from Wishlist`);
      } else {
        wishlist.push(product);
        setCartNotification(`Added ${product.name} to Wishlist!`);
      }
      localStorage.setItem('carneiz_wishlist', JSON.stringify(wishlist));
    } catch {
      setCartNotification(`Updated Wishlist!`);
    }
    setTimeout(() => setCartNotification(null), 2500);
  };

  const displayedProducts = products.slice(0, 8);

  return (
    <section className="py-8 md:py-16 px-4 md:px-[5%] bg-white relative">
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A1A1A] text-white px-5 py-3 rounded-lg shadow-xl font-medium animate-bounce flex items-center gap-2">
          <span>✓</span> {cartNotification}
        </div>
      )}

      {/* Mobile View (2-Column Grid matching mobile design) */}
      <div className="block md:hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 m-0">Featured Products</h2>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Top requested premium cuts of the week</p>
          </div>
          <Link href="/products" className="text-[#8B1919] font-bold text-xs no-underline whitespace-nowrap pt-1 flex items-center gap-1">
            <span>VIEW ALL</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">No products currently available.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {displayedProducts.map((product, idx) => {
              const formattedPrice = `₦${Number(product.price).toLocaleString()}`;
              const imgSrc = product.imageUrl || '/assets/images/placeholder.jpg';

              return (
                <div
                  key={product._id || idx}
                  className="bg-white border border-gray-100 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs relative"
                >
                  <div>
                    <div className="relative h-32 bg-gray-50/50 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <Link href={`/products/${product._id}`} className="w-full h-full flex items-center justify-center">
                        <img
                          src={imgSrc}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </Link>
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <button
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className="w-6 h-6 rounded-full bg-white border border-gray-200 cursor-pointer flex items-center justify-center text-[10px] shadow-xs text-gray-500 hover:text-[#7A1A1A]"
                          title="Wishlist"
                        >
                          🤍
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {product.weight || '1.0 kg'}
                      </span>
                      <Link href={`/products/${product._id}`} className="no-underline text-inherit">
                        <h3 className="m-0 text-gray-900 text-xs font-bold line-clamp-1 mt-0.5 hover:text-[#8B1919] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-[#D97706] text-xs">
                          {formattedPrice}
                        </span>
                        <div className="flex text-[#D97706] text-[10px]">
                          {"★".repeat(product.rating || 5)}{"☆".repeat(5 - (product.rating || 5))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addingId === product._id}
                    className="w-full mt-2.5 py-2 bg-[#8B1919] hover:bg-[#6b1010] active:scale-[0.98] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none shadow-xs"
                  >
                    <span>🛒</span> {addingId === product._id ? 'ADDING...' : 'ADD TO CART'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 m-0 mb-2">Featured Products</h2>
            <p className="text-gray-600 m-0">Top requested premium cuts of the week</p>
          </div>
          <Link href="/products" className="text-[#8B1919] font-bold text-sm no-underline whitespace-nowrap hover:underline flex items-center gap-1">
            <span>VIEW ALL PRODUCTS</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {loading ? (
          /* Section-level skeleton loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded-xl mt-2"></div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 font-medium">No products currently available in the butchery shop.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedProducts.map((product) => {
              const formattedPrice = `₦${Number(product.price).toLocaleString()}`;
              return (
                <div key={product._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${product._id}`} className="block relative h-48 bg-gray-50 bg-cover bg-center overflow-hidden cursor-pointer" style={{ backgroundImage: `url(${product.imageUrl || '/assets/images/placeholder.jpg'})` }}>
                      <div className="absolute top-2 right-2 flex flex-row items-center gap-1.5 opacity-90 transition-all duration-200 group-hover:opacity-100 z-10">
                        <button 
                          onClick={(e) => handleAddToCompare(e, product)}
                          title="Compare product" 
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 cursor-pointer flex items-center justify-center text-xs shadow-xs hover:bg-gray-50 hover:text-[#7A1A1A] transition-colors"
                        >
                          🔄
                        </button>
                        <button 
                          onClick={(e) => handleToggleWishlist(e, product)}
                          title="Add to Wishlist" 
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 cursor-pointer flex items-center justify-center text-xs shadow-xs hover:bg-gray-50 hover:text-[#7A1A1A] transition-colors"
                        >
                          🤍
                        </button>
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md w-fit">
                        {product.weight}
                      </span>
                      <Link href={`/products/${product._id}`} className="no-underline text-inherit">
                        <h3 className="m-0 text-gray-800 text-lg font-bold group-hover:text-[#7A1A1A] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-extrabold text-[#7A1A1A] text-lg">
                          {formattedPrice}
                        </span>
                        <div className="flex text-amber-400 text-sm">
                          {"★★★★★"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button 
                      disabled={addingId === product._id}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full py-2.5 px-4 bg-[#7A1A1A] hover:bg-[#601414] text-white font-bold rounded-xl cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 shadow-xs disabled:opacity-75"
                    >
                      {addingId === product._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ADDING...</span>
                        </>
                      ) : (
                        <>
                          <span>🛒</span>
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prominent View All Button */}
      {!loading && displayedProducts.length > 0 && (
        <div className="mt-8 md:mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#8B1919] hover:bg-[#6b1010] text-white font-bold text-xs md:text-sm tracking-wider uppercase rounded-xl shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] no-underline group"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  );
}
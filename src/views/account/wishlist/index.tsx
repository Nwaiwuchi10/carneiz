"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AccountLayout from '@/src/components/Account/AccountLayout';
import { useCart } from '@/src/context/CartContext';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('carneiz_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleWishlist = (id: string | number) => {
    const updated = wishlist.filter(item => (item._id || item.id) !== id);
    setWishlist(updated);
    try {
      localStorage.setItem('carneiz_wishlist', JSON.stringify(updated));
    } catch {}
  };

  const handleAddToCart = (item: any) => {
    const itemId = item._id || item.id;
    setAddedId(itemId);
    addToCart({
      _id: itemId,
      name: item.name,
      price: typeof item.price === 'number' ? item.price : Number(String(item.price).replace(/[^0-9.]/g, '')) || 0,
      weight: item.weight || '1.0 kg',
      quantity: 1,
      imageUrl: item.imageUrl || item.image || '/assets/images/placeholder.jpg',
    });
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <AccountLayout activeTab="wishlist">
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-2xl font-bold text-gray-900">My Wishlist ({wishlist.length} Items)</h2>
        <Link href="/products" className="text-xs font-bold text-[#7A1A1A] hover:underline uppercase tracking-wider">
          Browse Catalog &rarr;
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs max-w-lg mx-auto">
          <span className="text-4xl block mb-3">🤍</span>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your Wishlist is Empty</h3>
          <p className="text-gray-500 text-xs leading-relaxed mb-6">
            You haven't saved any cuts to your wishlist yet. Browse our butcher shop to save your favorite cuts for later.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl no-underline tracking-wider uppercase transition-colors"
          >
            Explore Fresh Cuts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(item => {
            const itemId = item._id || item.id;
            const formattedPrice = typeof item.price === 'number' ? `₦${item.price.toLocaleString()}` : item.price;
            return (
              <div key={itemId} className="bg-white border border-gray-100 rounded-xl overflow-hidden p-4 relative flex flex-col shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md group">
                {/* Heart Icon */}
                <button 
                  onClick={() => toggleWishlist(itemId)}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur w-8 h-8 rounded-full border border-gray-100 flex justify-center items-center cursor-pointer text-[#8B1919] hover:bg-[#8B1919] hover:text-white transition-colors duration-200 z-10"
                  aria-label="Remove from wishlist"
                >
                  ♥
                </button>
                
                <div 
                  className="w-full h-[180px] bg-gray-100 bg-cover bg-center mb-4 rounded-lg" 
                  style={{ backgroundImage: `url(${item.imageUrl || item.image || '/assets/images/placeholder.jpg'})` }}
                />
                
                <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block w-fit mb-2">
                  {item.weight || '1.0 kg'}
                </div>
                <div className="font-semibold text-gray-900 text-base mb-2 line-clamp-1">{item.name}</div>
                
                <div className="flex justify-between items-center mb-4 mt-auto">
                  <div className="font-bold text-[#8B1919] text-lg">{formattedPrice}</div>
                  <div className="text-[#FFC107] text-xs tracking-widest">★★★★★</div>
                </div>
                
                <button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full p-2.5 bg-white hover:bg-[#8B1919] text-[#8B1919] hover:text-white border border-[#8B1919] rounded-lg font-bold text-xs cursor-pointer transition-colors duration-200 tracking-wider uppercase"
                >
                  {addedId === itemId ? 'ADDED TO CART!' : 'ADD TO CART'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}

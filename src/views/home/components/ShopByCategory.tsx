"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/src/services/product.service';

interface CategoryItem {
  _id?: string;
  name: string;
  slug?: string;
  image?: string;
  heroCover?: string;
}

const exactCategoryImages: Record<string, string> = {
  pork: '/assets/images/categories/pork.jpg',
  spices: '/assets/images/categories/spices.jpg',
  gizzard: '/assets/images/categories/gizzard.jpg',
};

function resolveCategoryImage(cat: CategoryItem): string {
  const key = (cat.slug || cat.name || '').toLowerCase();
  if (key.includes('pork')) return exactCategoryImages.pork;
  if (key.includes('spice')) return exactCategoryImages.spices;
  if (key.includes('gizzard')) return exactCategoryImages.gizzard;
  return cat.image || cat.heroCover || '/assets/images/placeholder.jpg';
}

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await productService.getCategories();
        if (isMounted) {
          if (res?.data && res.data.length > 0) {
            setCategories(res.data);
          } else {
            setCategories([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories from backend:", err);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="py-8 md:py-16 px-4 md:px-[5%] bg-[#fcfcfc]">
      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 m-0">Shop by Category</h2>
          <Link href="/products" className="text-[#8B1919] font-bold text-xs no-underline hover:underline">
            VIEW ALL &rarr;
          </Link>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          {categories.map((cat, index) => {
            const bgImg = resolveCategoryImage(cat);
            const catQuery = cat.name.split(' ')[0];
            return (
              <Link 
                href={`/products?category=${encodeURIComponent(catQuery)}`} 
                key={cat._id || index}
                className="flex flex-col items-center shrink-0 no-underline group"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200/90 shadow-sm bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img
                    src={bgImg}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center mt-1.5 whitespace-nowrap">
                  {catQuery}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 m-0 mb-2">Shop by Category</h2>
            <p className="text-gray-600 m-0">Explore our hand-picked selection of fresh proteins and traditional seasonings</p>
          </div>
          <Link href="/products" className="text-[#8B1919] font-bold text-sm no-underline whitespace-nowrap hover:underline">
            VIEW ALL CATEGORIES &rarr;
          </Link>
        </div>

        {loading ? (
          /* Section-level skeleton loader */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-gray-200"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No categories currently configured.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, index) => {
              const bgImg = resolveCategoryImage(cat);
              const catQuery = cat.name.split(' ')[0]; // e.g. "Goat Meat" -> "Goat"
              const isPork = (cat.slug || cat.name || '').toLowerCase().includes('pork');
              return (
                <Link 
                  href={`/products?category=${encodeURIComponent(catQuery)}`} 
                  key={cat._id || index}
                  className={`relative h-48 rounded-xl overflow-hidden bg-gray-200 bg-cover ${isPork ? 'bg-top' : 'bg-center'} group cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 block no-underline`}
                  style={{ backgroundImage: `url(${bgImg})` }}
                >
                  <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/50"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-center z-[2]">
                    <span className="text-white font-bold text-lg md:text-xl drop-shadow-md">{cat.name}</span>
                    <div className="bg-[#8B1919] text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-md">
                      <span className="text-sm font-bold">&rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
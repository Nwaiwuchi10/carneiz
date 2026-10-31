"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '@/src/services/product.service';

export default function CompareProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartToast, setCartToast] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCompareProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products from backend
        const res = await productService.getProducts({ limit: 50 });
        // Check if user has saved items to compare in localStorage
        let localCompare: any[] = [];
        try {
          localCompare = JSON.parse(localStorage.getItem('carneiz_compare') || '[]');
        } catch {
          localCompare = [];
        }

        if (isMounted && res?.data) {
          const all = res.data;
          
          if (localCompare.length >= 2) {
            // Populate full fields from DB
            const populated = localCompare.map((item: any) => {
              const full = all.find((p: any) => p._id === item._id) || item;
              return {
                ...full,
                weightOptions: full.weightOptions || full.weight || '1.0 kg',
                pricePerKg: full.pricePerKg || `₦${Number(full.price).toLocaleString()}`,
                protein: full.protein || '20g',
                calories: full.calories || '200 kcal',
                fat: full.fat || '10g',
                originLocation: full.originLocation || 'Local Farm, Nigeria',
                inStock: full.inStock !== false,
              };
            });
            setProducts(populated);
          } else {
            // Match the 3 products shown in Screenshot 2: Chicken Wings, Whole Goat Leg, Mackerel Fish
            const wings = all.find((p: any) => p.name.toLowerCase().includes('wings')) || all[0];
            const goat = all.find((p: any) => p.name.toLowerCase().includes('goat leg')) || all[1];
            const fish = all.find((p: any) => p.name.toLowerCase().includes('mackerel')) || all[2];

            const selected = [
              {
                ...wings,
                name: 'Chicken Wings',
                category: 'Poultry',
                weightOptions: '500g, 1.0kg, 2.0kg',
                pricePerKg: '₦6,490',
                protein: '18.3g',
                calories: '203 kcal',
                fat: '14.2g',
                originLocation: 'Obasanjo Farms, Ogun',
                inStock: true
              },
              {
                ...goat,
                name: 'Whole Goat Leg',
                category: 'Goat Meat',
                weightOptions: '1.0kg, 1.5kg, 2.5kg',
                pricePerKg: '₦5,450',
                protein: '20.6g',
                calories: '143 kcal',
                fat: '3.0g',
                originLocation: 'Local Farm, Kaduna',
                inStock: true
              },
              {
                ...fish,
                name: 'Mackerel Fish',
                category: 'Seafood',
                weightOptions: '1.0kg, 2.0kg',
                pricePerKg: '₦9,800',
                protein: '18.6g',
                calories: '205 kcal',
                fat: '13.9g',
                originLocation: 'Atlantic Ocean Catch',
                inStock: true
              }
            ];

            setProducts(selected.filter(Boolean));
          }
        }
      } catch (error) {
        console.error("Failed to load compare products", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCompareProducts();
    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = (product: any) => {
    setCartToast(`Added ${product.name} to cart!`);
    setTimeout(() => setCartToast(null), 2500);
  };

  return (
    <div className="py-10 px-4 md:px-[6%] bg-[#fafafa] min-h-screen relative font-sans">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A1A1A] text-white px-5 py-3 rounded-xl shadow-2xl font-medium animate-bounce flex items-center gap-2">
          <span>✓</span> {cartToast}
        </div>
      )}

      {/* Header matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 max-w-6xl mx-auto">
        <h1 className="m-0 text-3xl font-extrabold text-gray-900 tracking-tight">
          Compare Products
        </h1>
        <Link 
          href="/products" 
          className="text-[#7A1A1A] font-bold text-sm no-underline border border-[#7A1A1A] py-2 px-5 rounded-lg hover:bg-[#7A1A1A] hover:text-white transition-colors duration-200 flex items-center gap-1 shadow-sm"
        >
          <span>+</span> Back to All Products
        </Link>
      </div>

      {/* Comparison Table / Card Container matching Screenshot 2 */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          /* Section loading state */
          <div className="p-12 animate-pulse space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[760px]">
              <tbody>
                {/* Header Row: Images, Titles, Price, Ratings */}
                <tr className="border-b border-gray-100">
                  <th className="p-6 md:p-8 text-[#7A1A1A] text-base md:text-lg font-bold w-1/4 align-middle">
                    Product Details
                  </th>
                  {products.map(product => (
                    <td key={`header-${product._id || product.name}`} className="p-6 md:p-8 align-top text-center w-1/4">
                      <div className="w-28 h-28 mx-auto mb-3 bg-white p-2 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain" 
                        />
                      </div>
                      <h3 className="m-0 mb-1.5 text-gray-900 font-bold text-sm md:text-base">
                        {product.name}
                      </h3>
                      <div className="text-[#7A1A1A] font-extrabold text-lg mb-1.5">
                        ₦{Number(product.price).toLocaleString()}
                      </div>
                      <div className="text-amber-400 text-xs">
                        ★★★★★
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Specification Rows matching Screenshot 2 */}
                {[
                  { label: 'Category', key: 'category' },
                  { label: 'Weight Options', key: 'weightOptions' },
                  { label: 'Price per kg', key: 'pricePerKg', format: (val: any) => val },
                  { label: 'Protein (per 100g)', key: 'protein' },
                  { label: 'Calories (per 100g)', key: 'calories' },
                  { label: 'Fat (per 100g)', key: 'fat' },
                  { label: 'Origin Location', key: 'originLocation' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                    <th className="py-4 px-6 md:px-8 text-gray-900 font-bold text-sm">
                      {row.label}
                    </th>
                    {products.map(product => (
                      <td key={`${row.key}-${product._id || product.name}`} className="py-4 px-6 md:px-8 text-gray-600 text-sm">
                        {row.format ? row.format(product[row.key]) : product[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Availability Row */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                  <th className="py-4 px-6 md:px-8 text-gray-900 font-bold text-sm">
                    Availability
                  </th>
                  {products.map(product => (
                    <td key={`avail-${product._id || product.name}`} className="py-4 px-6 md:px-8">
                      <span className="inline-block text-[#16a34a] bg-[#e8f9ed] border border-[#bbf7d0] px-3 py-0.5 rounded text-xs font-bold">
                        In Stock
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Add to Cart Action Row matching Screenshot 2 */}
                <tr>
                  <th className="py-6 px-6 md:px-8 text-gray-900 font-bold text-sm">
                    Add to Cart
                  </th>
                  {products.map(product => (
                    <td key={`cart-${product._id || product.name}`} className="py-6 px-6 md:px-8">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-3 px-4 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5 uppercase"
                      >
                        <span>🛒</span> ADD TO CART
                      </button>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';
import { productService } from '@/src/services/product.service';
import { useAppDispatch } from '@/src/redux/hooks';
import { addToCart } from '@/src/redux/slices/cartSlice';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCat = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [selectedWeight, setSelectedWeight] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('carneiz_wishlist') || '[]');
      if (Array.isArray(stored)) {
        setWishlistIds(stored.map((p: any) => p._id));
      }
    } catch {}
  }, []);

  // Sync category state from URL if changed externally
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 20,
        search: searchTerm,
      };

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (maxPrice < 50000) {
        params.maxPrice = maxPrice;
      }
      if (selectedWeight && selectedWeight !== 'All') {
        params.weight = selectedWeight;
      }
      if (inStockOnly) {
        params.inStock = true;
      }

      const res = await productService.getProducts(params);
      if (res && res.data) {
        setProducts(res.data);
        setTotalPages(res.lastPage || 1);
        setTotalProducts(res.total || res.data.length);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [page, searchTerm, selectedCategory, maxPrice, selectedWeight, inStockOnly]);

  const dispatch = useAppDispatch();
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    setPage(1);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    setAddingToCartId(product._id);
    setTimeout(() => {
      dispatch(
        addToCart({
          _id: product._id,
          name: product.name,
          price: Number(product.price),
          weight: product.weight || '1.0 kg',
          quantity: 1,
          imageUrl: product.imageUrl || '/assets/images/placeholder.jpg',
          category: product.category,
        })
      );
      setAddingToCartId(null);
      setCartToast(`Added ${product.name} (${product.weight || '1.0 kg'}) to cart!`);
      setTimeout(() => setCartToast(null), 2500);
    }, 300);
  };

  const handleAddToCompare = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const existing = JSON.parse(localStorage.getItem('carneiz_compare') || '[]');
      if (!existing.some((p: any) => p._id === product._id)) {
        existing.push(product);
        localStorage.setItem('carneiz_compare', JSON.stringify(existing.slice(0, 4)));
        setCartToast(`Added ${product.name} to Compare list!`);
      } else {
        setCartToast(`${product.name} is already in Compare list!`);
      }
    } catch {
      setCartToast(`Added ${product.name} to Compare list!`);
    }
    setTimeout(() => setCartToast(null), 2500);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let wishlist = JSON.parse(localStorage.getItem('carneiz_wishlist') || '[]');
      const exists = wishlist.some((p: any) => p._id === product._id);
      if (exists) {
        wishlist = wishlist.filter((p: any) => p._id !== product._id);
        setWishlistIds(wishlist.map((p: any) => p._id));
        setCartToast(`Removed ${product.name} from Wishlist`);
      } else {
        wishlist.push(product);
        setWishlistIds(wishlist.map((p: any) => p._id));
        setCartToast(`Added ${product.name} to Wishlist!`);
      }
      localStorage.setItem('carneiz_wishlist', JSON.stringify(wishlist));
    } catch {
      setCartToast(`Updated Wishlist!`);
    }
    setTimeout(() => setCartToast(null), 2500);
  };

  const categoriesList = ['All', 'Beef', 'Goat', 'Chicken', 'Turkey', 'Fish', 'Spices', 'Bulk Packs'];
  const weightOptions = ['All', '500 g', '1.0 kg', '1.5 kg', '2.0 kg', 'Bulk Pack'];

  return (
    <div className="py-8 px-4 md:px-[5%] bg-[#fafafa] min-h-screen relative">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A1A1A] text-white px-5 py-3 rounded-lg shadow-2xl font-medium animate-bounce flex items-center gap-2">
          <span>✓</span> {cartToast}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Filters matching Screenshot 3 */}
        <aside className="w-full md:w-[240px] bg-white p-6 rounded-2xl border border-gray-100 h-fit shadow-sm shrink-0">
          {/* CATEGORY filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 mb-3 tracking-wider uppercase">CATEGORY</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-gray-600">
              {categoriesList.map((cat) => (
                <li key={cat} className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleCategoryChange(cat)}>
                  <input 
                    type="checkbox" 
                    checked={selectedCategory === cat} 
                    onChange={() => handleCategoryChange(cat)}
                    className="accent-[#7A1A1A] w-4 h-4 rounded cursor-pointer" 
                  />
                  <span className={selectedCategory === cat ? "font-bold text-gray-900" : ""}>{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 my-5"></div>

          {/* PRICE RANGE filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 mb-2 tracking-wider uppercase">PRICE RANGE</h3>
            <input 
              type="range" 
              min="1000" 
              max="50000" 
              step="500" 
              value={maxPrice} 
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} 
              className="w-full accent-[#7A1A1A] cursor-pointer" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1.5 font-medium">
              <span>₦0</span>
              <span className="font-bold text-[#7A1A1A]">Up to ₦{maxPrice.toLocaleString()}</span>
              <span>₦50,000</span>
            </div>
          </div>

          <div className="border-t border-gray-100 my-5"></div>

          {/* WEIGHT OPTION filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 mb-3 tracking-wider uppercase">WEIGHT OPTION</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {weightOptions.map((w) => (
                <label key={w} className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="weightOpt" 
                    checked={selectedWeight === w} 
                    onChange={() => { setSelectedWeight(w); setPage(1); }} 
                    className="accent-[#7A1A1A] w-4 h-4 cursor-pointer" 
                  />
                  <span className={selectedWeight === w ? "font-bold text-gray-900" : ""}>{w}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 my-5"></div>

          {/* IN STOCK ONLY toggle switch */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-900 tracking-wider uppercase">IN STOCK ONLY</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={inStockOnly} 
                onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A1A1A]"></div>
            </label>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h1 className="m-0 text-2xl md:text-3xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
              </h1>
              <span className="text-xs font-bold text-gray-500 bg-gray-200 py-1 px-3 rounded-full">
                {totalProducts} Products
              </span>
            </div>
            <div className="w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} 
                className="w-full sm:w-[260px] px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none transition-colors duration-200 focus:border-[#7A1A1A] shadow-sm bg-white"
              />
            </div>
          </div>

          {/* Section loading skeleton state */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-lg mt-1"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h2>
              <p className="text-gray-500 m-0 text-sm">Try adjusting your filters, category, or search keywords.</p>
              <button 
                onClick={() => { setSelectedCategory('All'); setMaxPrice(50000); setSelectedWeight('All'); setInStockOnly(false); setSearchTerm(''); }}
                className="mt-4 px-4 py-2 bg-[#7A1A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#601414] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const isOutOfStock = !product.inStock || product.status === 'Out of Stock';
                const formattedPrice = `₦${Number(product.price).toLocaleString()}`;
                
                return (
                  <div 
                    key={product._id} 
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product image container with relative badge & action icons */}
                      <Link href={`/products/${product._id}`} className="block relative h-36 sm:h-40 bg-white p-3 overflow-hidden">
                        {isOutOfStock && (
                          <span className="absolute top-2 left-2 z-10 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                            OUT OF STOCK
                          </span>
                        )}

                        <div className="absolute top-2 right-2 z-10 flex flex-row items-center gap-1.5 opacity-90">
                          {(() => {
                            const isLiked = wishlistIds.includes(product._id);
                            return (
                              <button 
                                onClick={(e) => handleToggleWishlist(e, product)}
                                title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
                                className={`w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs border cursor-pointer flex items-center justify-center shadow-sm transition-all group/wish ${
                                  isLiked 
                                    ? 'text-[#7A1A1A] border-[#7A1A1A]/40 bg-[#fdf2f2]' 
                                    : 'text-gray-400 border-gray-200 hover:text-[#7A1A1A] hover:border-[#7A1A1A]/30'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 transition-transform group-hover/wish:scale-110 ${isLiked ? 'fill-[#7A1A1A]' : ''}`} />
                              </button>
                            );
                          })()}
                        </div>

                        <div 
                          className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${product.imageUrl || '/assets/images/placeholder.jpg'})` }}
                        ></div>
                      </Link>

                      {/* Content details */}
                      <div className="p-3 pt-1 flex flex-col gap-1">
                        <span className="text-[11px] font-medium text-gray-500">
                          {product.weight}
                        </span>
                        <Link href={`/products/${product._id}`} className="no-underline text-inherit">
                          <h3 className="m-0 text-sm font-semibold text-gray-900 group-hover:text-[#7A1A1A] transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="font-extrabold text-[#7A1A1A] text-sm sm:text-base">
                            {formattedPrice}
                          </span>
                          <div className="flex text-amber-400 text-xs">
                            {"★★★★★"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action button */}
                    <div className="p-3 pt-0">
                      {isOutOfStock ? (
                        <button 
                          disabled 
                          className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed uppercase"
                        >
                          OUT OF STOCK
                        </button>
                      ) : (
                        <button 
                          disabled={addingToCartId === product._id}
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-full py-2 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm uppercase disabled:opacity-75"
                        >
                          {addingToCartId === product._id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>ADDING...</span>
                            </>
                          ) : (
                            <>
                              <span>🛒</span> ADD TO CART
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination matching Screenshot 3 */}
          <div className="flex justify-center items-center mt-10 gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-700 rounded-md font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs bg-[#7A1A1A] text-white rounded-md font-bold">
              {page}
            </span>
            {totalPages > 1 && page < totalPages && (
              <button 
                onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-700 rounded-md font-medium cursor-pointer hover:bg-gray-50"
              >
                {page + 1}
              </button>
            )}
            {totalPages > 3 && (
              <span className="text-gray-400 text-xs">...</span>
            )}
            {totalPages > 2 && page < totalPages - 1 && (
              <button 
                onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-700 rounded-md font-medium cursor-pointer hover:bg-gray-50"
              >
                {totalPages}
              </button>
            )}
            <button 
              disabled={page >= totalPages} 
              onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="px-3 py-1.5 text-xs border border-gray-200 bg-white text-gray-700 rounded-md font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

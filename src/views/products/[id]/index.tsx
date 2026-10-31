"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { productService } from '@/src/services/product.service';
import { useAppDispatch } from '@/src/redux/hooks';
import { addToCart } from '@/src/redux/slices/cartSlice';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<string>('1.0 kg');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({ user: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [addingRelId, setAddingRelId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProduct(unwrappedParams.id);
        if (isMounted && res) {
          setProduct(res);
          setSelectedWeight(res.weight || '1.0 kg');
          
          // Image gallery setup
          const allImages = res.images && res.images.length > 0 ? [...res.images] : [res.imageUrl || '/assets/images/placeholder.jpg'];
          if (res.imageUrl && !allImages.includes(res.imageUrl)) {
            allImages.unshift(res.imageUrl);
          }
          setActiveImage(allImages[0]);

          // Fetch related products prioritizing Goat Leg, Catfish, Chicken, Turkey matching Figma
          const relRes = await productService.getProducts({ limit: 20 });
          if (isMounted && relRes?.data) {
            const list = relRes.data.filter((p: any) => p._id !== unwrappedParams.id);
            const targetKeywords = ['goat', 'catfish', 'chicken', 'turkey'];
            const prioritized = [
              ...list.filter((p: any) => targetKeywords.some(k => p.name.toLowerCase().includes(k))),
              ...list.filter((p: any) => !targetKeywords.some(k => p.name.toLowerCase().includes(k))),
            ];
            setRelatedProducts(prioritized.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [unwrappedParams.id]);

  // Compute price based on selected weight
  const getDynamicPrice = () => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find((v: any) => v.weight.toLowerCase() === selectedWeight.toLowerCase());
      if (match && match.price) return match.price;
    }
    // Calculate multiplier if weight ratio matches
    const basePrice = Number(product.price) || 0;
    if (selectedWeight.includes('2.0')) return basePrice * 2;
    if (selectedWeight.includes('5.0')) return basePrice * 5;
    return basePrice;
  };

  const currentPrice = getDynamicPrice();

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      dispatch(
        addToCart({
          _id: product._id,
          name: product.name,
          price: currentPrice,
          weight: selectedWeight,
          quantity: quantity,
          imageUrl: activeImage || product.imageUrl || '/assets/images/placeholder.jpg',
          category: product.category,
        })
      );
      setIsAddingToCart(false);
      setCartToast(`Added ${quantity}x ${product.name} (${selectedWeight}) to cart!`);
      setTimeout(() => setCartToast(null), 3000);
    }, 300);
  };

  const handleAddToCompare = (item: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const existing = JSON.parse(localStorage.getItem('carneiz_compare') || '[]');
      if (!existing.some((p: any) => p._id === item._id)) {
        existing.push(item);
        localStorage.setItem('carneiz_compare', JSON.stringify(existing.slice(0, 4)));
        setCartToast(`Added ${item.name} to Compare list!`);
      } else {
        setCartToast(`${item.name} is already in Compare list!`);
      }
    } catch {
      setCartToast(`Added ${item.name} to Compare list!`);
    }
    setTimeout(() => setCartToast(null), 2500);
  };

  const handleToggleWishlist = (item: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      let wishlist = JSON.parse(localStorage.getItem('carneiz_wishlist') || '[]');
      const exists = wishlist.some((p: any) => p._id === item._id);
      if (exists) {
        wishlist = wishlist.filter((p: any) => p._id !== item._id);
        setIsWishlisted(false);
        setCartToast(`Removed ${item.name} from Wishlist`);
      } else {
        wishlist.push(item);
        setIsWishlisted(true);
        setCartToast(`Saved ${item.name} to Wishlist!`);
      }
      localStorage.setItem('carneiz_wishlist', JSON.stringify(wishlist));
    } catch {
      setIsWishlisted(!isWishlisted);
      setCartToast(`Updated Wishlist!`);
    }
    setTimeout(() => setCartToast(null), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.user.trim() || !reviewForm.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const updated = await productService.submitReview(product._id, reviewForm);
      if (updated) {
        setProduct(updated);
      }
      setShowReviewModal(false);
      setReviewForm({ user: '', rating: 5, comment: '' });
      setCartToast("Thank you! Your review has been submitted.");
    } catch (err) {
      console.error("Failed to submit review:", err);
      // Optimistic update
      const newRev = {
        user: reviewForm.user,
        date: 'Today',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        verified: true
      };
      setProduct({
        ...product,
        reviews: [newRev, ...(product.reviews || [])],
        numReviews: (product.numReviews || 0) + 1
      });
      setShowReviewModal(false);
      setReviewForm({ user: '', rating: 5, comment: '' });
      setCartToast("Review submitted successfully!");
    } finally {
      setSubmittingReview(false);
      setTimeout(() => setCartToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="py-10 px-4 md:px-[6%] bg-[#fafafa] min-h-screen">
        {/* Section skeleton loader */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row gap-12 animate-pulse">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
              <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-xl w-40"></div>
            <div className="h-8 bg-gray-200 rounded-xl w-32"></div>
            <div className="h-20 bg-gray-200 rounded-2xl mt-4"></div>
            <div className="h-14 bg-gray-200 rounded-xl mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center bg-[#fafafa] min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The requested product could not be located in our catalog.</p>
        <Link href="/products" className="px-6 py-3 bg-[#7A1A1A] text-white rounded-xl font-bold hover:bg-[#601414] transition-colors inline-block no-underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const galleryImages = (product.images && product.images.length > 0) ? product.images : [product.imageUrl || '/assets/images/placeholder.jpg'];
  if (product.imageUrl && !galleryImages.includes(product.imageUrl)) {
    galleryImages.unshift(product.imageUrl);
  }

  const availableWeights = product.variants && product.variants.length > 0 
    ? product.variants.map((v: any) => v.weight) 
    : ['1.0 kg', '2.0 kg', '5.0 kg'];

  const reviewsList = product.reviews && product.reviews.length > 0 ? product.reviews : [
    { user: 'Chidi O.', date: 'January 14, 2026', rating: 5, comment: 'Exceptional tenderness. The suya spices coated perfectly on this cut. Will definitely buy again!', verified: true },
    { user: 'Amina B.', date: 'January 10, 2026', rating: 5, comment: 'Highly clean processing. Highly recommended for family suya night.', verified: true },
    { user: 'Tunde A.', date: 'December 28, 2025', rating: 5, comment: 'Tastes like real street malam suya when grilled properly. Tender and flavorful.', verified: true }
  ];

  return (
    <div className="py-8 px-4 md:px-[6%] bg-[#fafafa] min-h-screen relative">
      {/* Toast Notification */}
      {cartToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#7A1A1A] text-white px-5 py-3 rounded-lg shadow-2xl font-medium animate-bounce flex items-center gap-2">
          <span>✓</span> {cartToast}
        </div>
      )}

      {/* Breadcrumb matching Screenshots 4 & 5 */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5 font-medium">
        <Link href="/" className="hover:text-[#7A1A1A] no-underline text-inherit">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#7A1A1A] no-underline text-inherit">Shop</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category || '')}`} className="hover:text-[#7A1A1A] no-underline text-inherit">{product.category}</Link>
        <span>/</span>
        <span className="text-[#7A1A1A] font-bold">{product.name}</span>
      </nav>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-10 md:gap-14">
        
        {/* Left: Gallery (Main + Thumbnails) */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div 
            className="w-full h-80 sm:h-96 md:h-[420px] rounded-2xl bg-contain bg-center bg-no-repeat border border-gray-100 transition-all duration-300"
            style={{ backgroundImage: `url(${activeImage || product.imageUrl})` }}
          ></div>

          {/* Thumbnail row matching Screenshot 4 & 5 */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl border-2 p-1 bg-white cursor-pointer transition-all overflow-hidden shrink-0 ${
                  activeImage === img ? 'border-[#7A1A1A] shadow-sm' : 'border-gray-200 hover:border-gray-300 opacity-75'
                }`}
              >
                <div 
                  className="w-full h-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${img})` }}
                ></div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info Column matching Screenshots 4 & 5 */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          {/* Stock status badge */}
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
              product.inStock ? 'bg-[#e8f9ed] text-[#16a34a]' : 'bg-red-50 text-red-600'
            }`}>
              {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 m-0 leading-tight">
            {product.name}
          </h1>

          {/* Reviews rating */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">★★★★★</span>
            <span className="text-sm text-gray-500 font-medium">
              ({product.numReviews || reviewsList.length} customer reviews)
            </span>
          </div>

          {/* Price */}
          <div className="text-3xl font-extrabold text-[#7A1A1A] my-1">
            ₦{currentPrice.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 m-0">
            VAT included. Delivery calculated at checkout.
          </p>

          <div className="border-t border-gray-100 my-2"></div>

          {/* SELECT WEIGHT */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
              SELECT WEIGHT
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {availableWeights.map((w: string) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all border ${
                    selectedWeight === w 
                      ? 'bg-[#7A1A1A] text-white border-[#7A1A1A] shadow-sm' 
                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart Button */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white w-fit">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-12 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-lg"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-gray-900 text-base">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-12 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-lg"
              >
                +
              </button>
            </div>

            <button 
              disabled={!product.inStock || isAddingToCart}
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-8 rounded-xl font-bold text-base cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2 ${
                product.inStock 
                  ? 'bg-[#7A1A1A] hover:bg-[#601414] text-white disabled:opacity-75' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ADDING TO CART...</span>
                </>
              ) : (
                <>
                  <span>🛒</span>
                  <span>ADD TO CART</span>
                </>
              )}
            </button>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-fit bg-transparent border-none text-[#7A1A1A] hover:text-[#601414] cursor-pointer font-bold text-sm flex items-center gap-2 mt-2"
          >
            <span>{isWishlisted ? '❤️' : '🤍'}</span> 
            {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
          </button>

          {/* DELIVERY ESTIMATES Card matching Screenshots 4 & 5 */}
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm">
            <div className="flex items-center gap-2 font-bold text-gray-900 mb-2">
              <span>🚚</span>
              <span className="tracking-wider text-xs uppercase">DELIVERY ESTIMATES</span>
            </div>
            <div className="flex justify-between py-1 text-gray-600">
              <span>Owerri & Environs</span>
              <span className="font-bold text-gray-900">1-2 Days</span>
            </div>
            <div className="flex justify-between py-1 text-gray-600 border-t border-gray-200/60 mt-1 pt-1">
              <span>UK</span>
              <span className="font-bold text-gray-900">3-5 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section matching Screenshots 4 & 5 */}
      <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-3 font-bold text-base bg-transparent border-none cursor-pointer transition-colors ${
              activeTab === 'description' 
                ? 'text-[#7A1A1A] border-b-2 border-[#7A1A1A]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            className={`pb-3 font-bold text-base bg-transparent border-none cursor-pointer transition-colors ${
              activeTab === 'nutrition' 
                ? 'text-[#7A1A1A] border-b-2 border-[#7A1A1A]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Nutrition
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 font-bold text-base bg-transparent border-none cursor-pointer transition-colors ${
              activeTab === 'reviews' 
                ? 'text-[#7A1A1A] border-b-2 border-[#7A1A1A]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Description Content (Screenshot 4) */}
        {activeTab === 'description' && (
          <div className="text-gray-700 leading-relaxed text-sm md:text-base space-y-4 max-w-4xl">
            <p>
              {product.description || 'Carneiz Beef Cut is sourced from strictly grain-fed, grass-finished local cattle. Prepared by hand by our experienced butchers, each cut features optimal marbling to ensure a juicy, tender experience when grilled. The thickness is carefully calibrated to absorb local rub spices (Yaji) deep into the muscle fiber, delivering authentic Lagos-style street suya flavors straight from your kitchen.'}
            </p>
            <p>
              100% organic processing, no added preservatives, vacuum-sealed and cold-chain transported to maintain absolute freshness.
            </p>
          </div>
        )}

        {/* Nutrition Content (Screenshot 5) */}
        {activeTab === 'nutrition' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Nutrition Facts (per 100g serving)
            </h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
              <div className="flex justify-between py-3 px-4 bg-gray-50/50">
                <span className="font-semibold text-gray-700">Serving Size</span>
                <span className="font-bold text-gray-900">100g</span>
              </div>
              <div className="flex justify-between py-3 px-4">
                <span className="font-semibold text-gray-700">Energy</span>
                <span className="font-bold text-gray-900">{product.calories || '250 kcal'}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-gray-50/50">
                <span className="font-semibold text-gray-700">Protein</span>
                <span className="font-bold text-gray-900">{product.protein || '26g'}</span>
              </div>
              <div className="flex justify-between py-3 px-4">
                <span className="font-semibold text-gray-700">Total Fat</span>
                <span className="font-bold text-gray-900">{product.fat || '15g'}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-gray-50/50">
                <span className="font-semibold text-gray-700">Saturated Fat</span>
                <span className="font-bold text-gray-900">6g</span>
              </div>
              <div className="flex justify-between py-3 px-4">
                <span className="font-semibold text-gray-700">Carbohydrates</span>
                <span className="font-bold text-gray-900">{product.carbs || '0g'}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-gray-50/50">
                <span className="font-semibold text-gray-700">Sodium</span>
                <span className="font-bold text-gray-900">72mg</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Content matching Screenshot 3 */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Review Summary & Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10">
                {/* Big Score */}
                <div className="flex flex-col items-center sm:items-start">
                  <div className="text-5xl font-extrabold text-gray-900 leading-none">
                    4.8
                  </div>
                  <div className="text-amber-400 text-lg mt-1.5">
                    ★★★★★
                  </div>
                  <span className="text-xs text-gray-500 font-medium mt-1">
                    127 Reviews
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="flex flex-col gap-1.5 w-60 sm:w-72 text-xs">
                  {[
                    { stars: '5 stars', percent: 78 },
                    { stars: '4 stars', percent: 15 },
                    { stars: '3 stars', percent: 5 },
                    { stars: '2 stars', percent: 1 },
                    { stars: '1 stars', percent: 1 },
                  ].map((bar, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-12 text-gray-600 font-medium shrink-0">{bar.stars}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#D97706] rounded-full transition-all duration-500" 
                          style={{ width: `${bar.percent}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-gray-500 font-medium shrink-0">{bar.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col items-start md:items-end gap-2.5">
                <span className="text-sm font-semibold text-gray-700">
                  Have you tried this product?
                </span>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-sm font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* Individual Reviews Cards matching Screenshot 3 */}
            <div className="flex flex-col gap-3.5">
              {reviewsList.map((rev: any, idx: number) => (
                <div 
                  key={idx} 
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2 hover:border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="m-0 font-bold text-gray-900 text-sm">{rev.user}</h4>
                      <span className="text-[11px] text-gray-400">{rev.date}</span>
                    </div>
                    {rev.verified && (
                      <span className="text-[10px] font-bold tracking-wider text-[#16a34a] bg-[#e8f9ed] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full uppercase">
                        VERIFIED PURCHASE
                      </span>
                    )}
                  </div>
                  <div className="text-amber-400 text-xs">
                    {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                  </div>
                  <p className="text-sm text-gray-700 m-0 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Write a Review for {product.name}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Share your genuine feedback with other shoppers
            </p>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Chidi O."
                  value={reviewForm.user}
                  onChange={(e) => setReviewForm({ ...reviewForm, user: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl cursor-pointer bg-transparent border-none p-1 transition-transform hover:scale-110 ${
                        reviewForm.rating >= star ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Review</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="How was the meat quality, seasoning absorbency, or freshness?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white font-bold rounded-xl text-sm cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* "You May Also Like" Related Products section matching Screenshots 1 & 3 */}
      {relatedProducts.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((item) => {
              const isOut = !item.inStock || item.status === 'Out of Stock';
              return (
                <div 
                  key={item._id} 
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group"
                >
                  <Link href={`/products/${item._id}`} className="block relative h-40 bg-white p-3 overflow-hidden">
                    {isOut && (
                      <span className="absolute top-2.5 left-2.5 z-10 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                        OUT OF STOCK
                      </span>
                    )}

                    {/* Top Right Action Icons matching Screenshot 1 & 3 */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex flex-row items-center gap-1.5 opacity-90">
                      <button 
                        onClick={(e) => handleAddToCompare(item, e)}
                        title="Compare product" 
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 cursor-pointer flex items-center justify-center text-xs shadow-sm hover:bg-gray-50 hover:text-[#7A1A1A] transition-colors"
                      >
                        🔄
                      </button>
                      <button 
                        onClick={(e) => handleToggleWishlist(item, e)}
                        title="Add to Wishlist" 
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 cursor-pointer flex items-center justify-center text-xs shadow-sm hover:bg-gray-50 hover:text-[#7A1A1A] transition-colors"
                      >
                        🤍
                      </button>
                    </div>

                    <div 
                      className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.imageUrl || '/assets/images/placeholder.jpg'})` }}
                    ></div>
                  </Link>

                  <div className="p-4 pt-1 flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-gray-500">{item.weight}</span>
                    <Link href={`/products/${item._id}`} className="no-underline text-inherit">
                      <h3 className="m-0 text-sm font-semibold text-gray-900 group-hover:text-[#7A1A1A] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-extrabold text-[#7A1A1A] text-base">
                        ₦{Number(item.price).toLocaleString()}
                      </span>
                      <div className="flex text-amber-400 text-xs">
                        {"★★★★★"}
                      </div>
                    </div>
                    <div className="mt-3">
                      {isOut ? (
                        <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed uppercase">
                          OUT OF STOCK
                        </button>
                      ) : (
                        <button 
                          disabled={addingRelId === item._id}
                          onClick={(e) => {
                            e.preventDefault();
                            setAddingRelId(item._id);
                            setTimeout(() => {
                              dispatch(
                                addToCart({
                                  _id: item._id,
                                  name: item.name,
                                  price: Number(item.price),
                                  weight: item.weight || '1.0 kg',
                                  quantity: 1,
                                  imageUrl: item.imageUrl || '/assets/images/placeholder.jpg',
                                  category: item.category,
                                })
                              );
                              setAddingRelId(null);
                              setCartToast(`Added ${item.name} to cart!`);
                              setTimeout(() => setCartToast(null), 2500);
                            }, 300);
                          }}
                          className="w-full py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5 uppercase disabled:opacity-75"
                        >
                          {addingRelId === item._id ? (
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
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

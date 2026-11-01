"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Camera, X, Loader2, CheckCircle2, ChevronDown, Search, ArrowRight } from 'lucide-react';
import AccountLayout from '@/src/components/Account/AccountLayout';
import { useAppDispatch } from '@/src/redux/hooks';
import { addToCart, setCartOpen } from '@/src/redux/slices/cartSlice';

interface OrderItem {
  id: string;
  date: string;
  customer: string;
  items: string;
  rawItems?: any[];
  total: number;
  deliveryPin?: string;
  status: string;
}

export default function OrderHistoryPage() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');

  // Reordering state
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  const fetchOrders = async (currentPage = 1, currentSearch = '', currentStatus = '') => {
    setLoading(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      const statusParam = currentStatus && currentStatus !== 'All Statuses' ? `&status=${encodeURIComponent(currentStatus)}` : '';
      const searchParam = currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : '';
      const res = await axios.get(`${apiUrl}/orders?page=${currentPage}&limit=6${searchParam}${statusParam}`);
      
      setOrders(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.warn('Failed to fetch orders, using reference orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, search, statusFilter);
  }, [page, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchOrders(1, e.target.value, statusFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleReorder = (order: OrderItem) => {
    setReorderingId(order.id);
    try {
      if (order.rawItems && order.rawItems.length > 0) {
        order.rawItems.forEach((it: any) => {
          dispatch(
            addToCart({
              _id: it._id || it.id || `item-${Date.now()}`,
              name: it.name,
              price: it.price || 9900,
              weight: it.weight || '1.0 kg',
              quantity: it.quantity || 1,
              imageUrl: it.imageUrl || '/assets/images/placeholder.jpg',
            })
          );
        });
      } else {
        dispatch(
          addToCart({
            _id: `reorder-${order.id}`,
            name: order.items.split(' (')[0] || 'Premium Beef Cut',
            price: order.total || 9900,
            weight: '1.0 kg',
            quantity: 1,
            imageUrl: 'https://res.cloudinary.com/pegpoaqj/image/upload/v1792314241/carneiz_products/f0fr61oztrrpbycs2fs5.png',
          })
        );
      }

      setToastMessage({
        text: `Order ${order.id} items added to your cart!`,
        type: 'success',
      });
      dispatch(setCartOpen(true));
    } catch (err) {
      setToastMessage({ text: 'Failed to reorder items', type: 'error' });
    } finally {
      setReorderingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const openReviewModal = (productName = '') => {
    setReviewProduct(productName);
    setRating(5);
    setReviewComment('');
    setReviewPhotos([]);
    setReviewSubmittedSuccess(false);
    setReviewModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setReviewPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setReviewPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      await axios.post(`${apiUrl}/products/review`, {
        productName: reviewProduct,
        rating,
        comment: reviewComment,
        photos: reviewPhotos,
      });
      setReviewSubmittedSuccess(true);
      try {
        const stored = localStorage.getItem('carneiz_user_reviews');
        const current = stored ? JSON.parse(stored) : [];
        current.unshift({
          id: `rev-${Date.now()}`,
          productName: reviewProduct,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating,
          comment: reviewComment,
          photo: reviewPhotos[0] || null,
          status: 'Pending Moderation',
        });
        localStorage.setItem('carneiz_user_reviews', JSON.stringify(current));
      } catch {}
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Failed to submit review.', type: 'error' });
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Great! (5/5)';
      case 4:
        return 'Good! (4/5)';
      case 3:
        return 'Average (3/5)';
      case 2:
        return 'Below Average (2/5)';
      case 1:
        return 'Poor (1/5)';
      default:
        return `${stars}/5`;
    }
  };

  return (
    <AccountLayout activeTab="orders">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' ? 'bg-[#7A1A1A] text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Red Banner matching Image 1 */}
      <div 
        onClick={() => openReviewModal('Premium Beef Suya Cut (1.0 kg)')}
        className="bg-[#7A1A1A] hover:bg-[#6e1616] text-white p-7 sm:p-9 rounded-2xl mb-8 shadow-sm cursor-pointer transition-all hover:shadow-md relative overflow-hidden group"
      >
        <div className="max-w-2xl">
          <h2 className="m-0 mb-2 text-xl sm:text-2xl font-extrabold tracking-tight">
            How was your recent order?
          </h2>
          <p className="m-0 text-white/90 text-xs sm:text-sm leading-relaxed">
            Your order #CM-40984 was delivered on Feb 12, 2026. Help others by sharing your honest thoughts on the <strong className="underline text-white">Premium Beef Suya Cut</strong>!
          </p>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/95 group-hover:translate-x-1 transition-transform">
          <span>Leave a Review</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Filter and Search Bar matching Image 1 */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-xs text-gray-900 tracking-wider">Filter by:</span>
          
          <div className="relative">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="pl-3.5 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 outline-none appearance-none focus:border-[#7A1A1A] cursor-pointer"
            >
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="pl-3.5 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 outline-none appearance-none focus:border-[#7A1A1A] cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Delivered</option>
              <option>Out for Delivery</option>
              <option>Processing</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={search} 
            onChange={handleSearch} 
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm outline-none transition-colors focus:border-[#7A1A1A]" 
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table matching Image 1 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-xs">
        <table className="w-full border-collapse text-left whitespace-nowrap min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/40 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="py-4 px-6">Order #</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Items</th>
              <th className="py-4 px-6">Total</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#7A1A1A]" />
                    <span className="text-gray-400 text-xs">Loading order history...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-500 text-sm">
                  No orders found matching your criteria.
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => (
                <tr key={`${order.id}-${idx}`} className="hover:bg-gray-50/60 transition-colors">
                  
                  {/* Order Reference */}
                  <td className="py-4 px-6 font-extrabold text-gray-900">
                    {order.id}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-gray-600 font-medium">
                    {order.date}
                  </td>

                  {/* Items */}
                  <td className="py-4 px-6 text-gray-700 font-medium max-w-xs truncate">
                    {order.items}
                  </td>

                  {/* Total */}
                  <td className="py-4 px-6 font-black text-gray-900">
                    ₦{order.total.toLocaleString()}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6">
                    {order.status === 'Delivered' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#e6f7ec] text-[#16a34a]">
                        Delivered
                      </span>
                    ) : order.status === 'Cancelled' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#fde8e8] text-[#e02424]">
                        Cancelled
                      </span>
                    ) : (
                      <div className="inline-flex flex-col items-start gap-1">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#fdf5f5] text-[#7A1A1A]">
                          {order.status || 'Out for Delivery'}
                        </span>
                        {order.deliveryPin && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            PIN: <strong className="text-[#7A1A1A]">{order.deliveryPin}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <Link 
                        href={`/track-order?orderId=${encodeURIComponent(order.id)}`}
                        className="text-gray-700 hover:text-[#7A1A1A] font-bold text-xs no-underline transition-colors"
                      >
                        View Details
                      </Link>
                      
                      <button 
                        onClick={() => handleReorder(order)}
                        disabled={reorderingId === order.id}
                        className="px-4 py-2 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {reorderingId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        <span>Reorder</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination matching Image 1 */}
      <div className="flex justify-center items-center mt-8 gap-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)} 
          className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = page === pageNum;
          return (
            <button 
              key={idx} 
              onClick={() => setPage(pageNum)} 
              className={`w-9 h-9 rounded-lg font-bold text-xs cursor-pointer transition-colors flex items-center justify-center ${
                isActive 
                  ? 'bg-[#7A1A1A] text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(page + 1)} 
          className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* ========================================================
          WRITE A REVIEW MODAL matching Image 3 & Image 4
          ======================================================== */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-9 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {reviewSubmittedSuccess ? (
              
              /* THANK YOU SUCCESS CARD matching Image 4 */
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#e8f9ed] text-[#16a34a] flex items-center justify-center text-3xl mx-auto shadow-xs">
                  ✓
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 m-0 mb-2">
                    Thank You!
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto m-0">
                    Your review for the <strong className="text-gray-900">{reviewProduct}</strong> has been submitted successfully. It is currently pending moderation and will appear on the store shortly once approved.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Link
                    href="/products"
                    className="w-full py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-extrabold rounded-xl uppercase tracking-wider block text-center no-underline transition-colors shadow-sm"
                  >
                    Continue Shopping
                  </Link>

                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-bold bg-transparent border-none cursor-pointer"
                  >
                    Back to Orders
                  </button>
                </div>
              </div>

            ) : (

              /* WRITE A REVIEW FORM matching Image 3 */
              <form onSubmit={handleSubmitReview} className="space-y-6">
                
                {/* Header */}
                <div className="text-center pb-2 border-b border-gray-100 relative">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="absolute right-0 top-0 p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 m-0">
                    Write a Review
                  </h2>
                  <p className="text-xs text-gray-500 m-0 mt-1 font-semibold">
                    {reviewProduct}
                  </p>
                </div>

                {/* Overall Rating matching Image 3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    OVERALL RATING *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const current = hoverRating !== null ? hoverRating : rating;
                        const filled = current >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setRating(star)}
                            className="text-2xl sm:text-3xl bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-110"
                          >
                            <span className={filled ? 'text-amber-400' : 'text-gray-300'}>
                              ★
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-[#7A1A1A]">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>
                </div>

                {/* Your Review Textarea matching Image 3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    YOUR REVIEW *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-4 bg-gray-50/60 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 leading-relaxed outline-none focus:border-[#7A1A1A] focus:bg-white resize-none"
                    placeholder="Tell us what you liked about cut tenderness, fresh spice marinade, and delivery speed..."
                  />
                </div>

                {/* Add Photos matching Image 3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider">
                    ADD PHOTOS (OPTIONAL)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Drag and Drop / Browse Upload Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-gray-200 hover:border-[#7A1A1A]/40 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-gray-50/40 flex flex-col items-center justify-center gap-1.5"
                    >
                      <Camera className="w-5 h-5 text-gray-400" />
                      <p className="text-xs text-gray-500 m-0">
                        Drag and drop, or <span className="font-bold text-[#7A1A1A]">browse</span> to upload
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </div>

                    {/* Photo Previews with delete button matching Image 3 */}
                    {reviewPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gray-200 shrink-0 shadow-xs group">
                        <img
                          src={photoUrl}
                          alt="Review Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          title="Remove photo"
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-[10px] cursor-pointer border-none shadow-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Action Buttons matching Image 3 */}
                <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 cursor-pointer transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewComment.trim()}
                    className="px-6 py-3 bg-[#7A1A1A] hover:bg-[#601414] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </AccountLayout>
  );
}

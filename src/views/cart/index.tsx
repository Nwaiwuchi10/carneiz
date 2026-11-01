"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import {
  removeFromCart,
  updateQuantity,
  applyDiscount,
  removeDiscount,
  clearCart,
} from '@/src/redux/slices/cartSlice';

export default function CartView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const discountCode = useAppSelector((state) => state.cart.discountCode);
  const discountPercent = useAppSelector((state) => state.cart.discountPercent);
  const deliveryFee = useAppSelector((state) => state.cart.deliveryFee);

  const [inputCode, setInputCode] = useState(discountCode || '');
  const [isApplying, setIsApplying] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const discountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const grandTotal = Math.max(0, subtotal + (items.length > 0 ? deliveryFee : 0) - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim();
    if (!cleanCode) return;
    setIsApplying(true);
    setAlertMsg(null);

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      const res = await fetch(`${apiUrl}/orders/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        dispatch(applyDiscount({ code: data.code, percent: data.percent }));
        setAlertMsg({
          text: `Discount code "${data.code}" applied! You saved ${data.percent}% on this order.`,
          type: 'success',
        });
      } else {
        throw new Error(data.message || 'Invalid or expired discount code.');
      }
    } catch (err: any) {
      setAlertMsg({
        text: err.message || 'Invalid discount code.',
        type: 'error',
      });
    } finally {
      setIsApplying(false);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      setAlertMsg({ text: 'Your cart is empty! Please add products before checking out.', type: 'error' });
      return;
    }
    setIsCheckingOut(true);
    setAlertMsg({ text: 'Syncing cart and proceeding to secure checkout...', type: 'success' });
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  };

  return (
    <div className="py-8 md:py-12 px-4 md:px-[5%] bg-[#fafafa] min-h-screen relative">

      {/* Response Message Toast / Banner */}
      {alertMsg && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          alertMsg.type === 'success' ? 'bg-[#7A1A1A] text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{alertMsg.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{alertMsg.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 m-0">
            Your Shopping Cart
          </h1>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                  dispatch(clearCart());
                  setAlertMsg({ text: 'All items removed from cart.', type: 'success' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR ALL CART</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items Table matching Screenshot 2 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              
              {/* Table Column Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                <div className="col-span-5">PRODUCT DETAILS</div>
                <div className="col-span-2 text-center">WEIGHT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-1 text-right">TOTAL</div>
              </div>

              {/* Items Rows */}
              {items.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="text-5xl block mb-3">🛒</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is currently empty</h3>
                  <p className="text-sm text-gray-500 mb-6">Looks like you haven't added any fresh butchery cuts yet.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1A1A] hover:bg-[#601414] text-white text-sm font-bold rounded-xl transition-colors shadow-sm no-underline"
                  >
                    <span>Browse Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const rowTotal = item.price * (item.quantity || 1);
                    return (
                      <div
                        key={`${item._id}-${item.weight}`}
                        className="p-5 sm:px-6 sm:py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Product details */}
                        <div className="sm:col-span-5 flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.imageUrl || '/assets/images/placeholder.jpg'}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <Link href={`/products/${item._id}`} className="no-underline text-inherit">
                              <h4 className="m-0 text-sm font-bold text-gray-900 hover:text-[#7A1A1A] transition-colors">
                                {item.name}
                              </h4>
                            </Link>
                            <span className="sm:hidden text-xs text-gray-500 mt-0.5 block">
                              ₦{item.price.toLocaleString()} per {item.weight || '1.0 kg'}
                            </span>
                          </div>
                        </div>

                        {/* Weight Badge matching Screenshot 2 */}
                        <div className="sm:col-span-2 flex sm:justify-center">
                          <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs">
                            {item.weight || '1.0 kg'}
                          </span>
                        </div>

                        {/* Unit Price */}
                        <div className="hidden sm:block sm:col-span-2 text-center text-sm font-semibold text-gray-800">
                          ₦{item.price.toLocaleString()}
                        </div>

                        {/* Quantity Stepper matching Screenshot 2 */}
                        <div className="sm:col-span-2 flex items-center sm:justify-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    id: item._id,
                                    weight: item.weight,
                                    quantity: Math.max(1, (item.quantity || 1) - 1),
                                  })
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    id: item._id,
                                    weight: item.weight,
                                    quantity: (item.quantity || 1) + 1,
                                  })
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Row Total & Delete Icon matching Screenshot 2 */}
                        <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-3">
                          <span className="text-sm font-extrabold text-[#7A1A1A] whitespace-nowrap">
                            ₦{rowTotal.toLocaleString()}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(removeFromCart({ id: item._id, weight: item.weight }))
                            }
                            title="Remove item"
                            className="w-8 h-8 rounded-full bg-[#fcedec] hover:bg-[#fadbd8] text-[#7A1A1A] flex items-center justify-center border-none cursor-pointer transition-colors p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Discount Code Form matching Screenshot 2 */}
            {items.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder="Enter Discount Code"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-900 text-gray-900 font-bold text-sm rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </form>

                {discountPercent > 0 && (
                  <button
                    onClick={() => {
                      dispatch(removeDiscount());
                      setInputCode('');
                      setAlertMsg({ text: 'Discount removed', type: 'success' });
                    }}
                    className="text-xs text-red-600 hover:underline cursor-pointer bg-transparent border-none p-0 w-fit"
                  >
                    Remove Discount ({discountPercent}%)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card matching Screenshot 2 */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-xl font-extrabold text-gray-900 m-0">Order Summary</h2>

              <div className="space-y-3.5 text-sm text-gray-600 border-b border-gray-100 pb-5">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-gray-900">
                    {items.length > 0 ? `₦${deliveryFee.toLocaleString()}` : '₦0'}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[#16a34a] font-semibold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total matching Screenshot 2 */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-base font-extrabold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-[#7A1A1A]">
                  ₦{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* PROCEED TO CHECKOUT Button matching Screenshot 2 */}
              <button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0 || isCheckingOut}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm ${
                  items.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#7A1A1A] hover:bg-[#601414] text-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'PROCEED TO CHECKOUT'
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/products"
                  className="text-xs text-gray-500 hover:text-gray-900 underline font-medium no-underline"
                >
                  &larr; Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

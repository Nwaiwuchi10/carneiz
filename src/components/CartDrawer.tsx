"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Loader2 } from 'lucide-react';
import DeleteConfirmationModal from '@/src/components/DeleteConfirmationModal';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import {
  setCartOpen,
  removeFromCart,
  updateQuantity,
  applyDiscount,
} from '@/src/redux/slices/cartSlice';

export default function CartDrawer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.cart.isOpen);
  const items = useAppSelector((state) => state.cart.items);
  const discountCode = useAppSelector((state) => state.cart.discountCode);
  const discountPercent = useAppSelector((state) => state.cart.discountPercent);

  const [inputCode, setInputCode] = useState(discountCode || '');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountMsg, setDiscountMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item?: { id: string; weight: string; name: string };
  }>({ isOpen: false });

  if (!isOpen) return null;

  const totalCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim();
    if (!cleanCode) return;
    setApplyingDiscount(true);
    setDiscountMsg(null);

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
        setDiscountMsg({ text: `Code applied: ${data.percent}% discount!`, type: 'success' });
      } else {
        throw new Error(data.message || 'Invalid or expired discount code.');
      }
    } catch (err: any) {
      setDiscountMsg({ text: err.message || 'Invalid discount code.', type: 'error' });
    } finally {
      setApplyingDiscount(false);
      setTimeout(() => setDiscountMsg(null), 4000);
    }
  };

  const handleViewCart = () => {
    dispatch(setCartOpen(false));
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(setCartOpen(false))}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[420px] bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header matching Screenshot 1 */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-extrabold text-gray-900 m-0">Shopping Cart</h2>
              <span className="bg-[#fcedec] text-[#7A1A1A] text-xs font-bold px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            </div>
            <button
              onClick={() => dispatch(setCartOpen(false))}
              className="w-8 h-8 rounded-full border border-[#7A1A1A] text-[#7A1A1A] hover:bg-red-50 flex items-center justify-center transition-colors bg-transparent cursor-pointer p-0"
              aria-label="Close Shopping Cart"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Feedback banner */}
          {discountMsg && (
            <div className={`text-xs font-bold px-4 py-2 border-b flex items-center gap-2 ${
              discountMsg.type === 'success'
                ? 'bg-[#e8f9ed] text-[#16a34a] border-[#bbf7d0]'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              <span>{discountMsg.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{discountMsg.text}</span>
            </div>
          )}

          {/* Items List matching Screenshot 1 */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <span className="text-4xl mb-2">🛒</span>
                <p className="font-semibold text-gray-600 m-0">Your cart is currently empty</p>
                <p className="text-xs text-gray-400 mt-1">Add tender cuts to start your butchery order</p>
                <button
                  onClick={() => dispatch(setCartOpen(false))}
                  className="mt-4 px-4 py-2 bg-[#7A1A1A] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#601414]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item._id}-${item.weight}`} className="pt-4 first:pt-0 flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl || '/assets/images/placeholder.jpg'}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Title & Price */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 m-0 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">
                      {item.weight || '1.0 kg'} • Qty: {item.quantity}
                    </p>
                    <span className="text-sm font-extrabold text-[#7A1A1A] mt-1 inline-block">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Quantity Stepper matching Screenshot 1 */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shrink-0">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item._id,
                            weight: item.weight,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-sm"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-gray-900 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item._id,
                            weight: item.weight,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Trash Icon matching Screenshot 1 */}
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        item: { id: item._id, weight: item.weight, name: item.name },
                      })
                    }
                    title="Remove item"
                    className="w-8 h-8 rounded-full bg-[#fcedec] hover:bg-[#fadbd8] text-[#7A1A1A] flex items-center justify-center border-none cursor-pointer shrink-0 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action matching Screenshot 1 */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
              {/* Discount Code Form */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Discount Code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gray-400"
                />
                <button
                  type="submit"
                  disabled={applyingDiscount}
                  className="px-5 py-2 border border-gray-900 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                >
                  {applyingDiscount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                </button>
              </form>

              {/* Subtotal */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-semibold text-gray-600">Subtotal</span>
                <span className="text-xl font-extrabold text-[#7A1A1A]">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 m-0">
                Taxes and shipping fees computed at final checkout step.
              </p>

              {/* Action Buttons matching Screenshot 1 */}
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={handleViewCart}
                  className="w-full py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white rounded-lg font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
                >
                  VIEW CART
                </button>

                <button
                  onClick={() => dispatch(setCartOpen(false))}
                  className="w-full py-2 bg-transparent text-gray-700 hover:text-gray-900 text-xs font-semibold cursor-pointer border-none underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Item Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Remove Item from Cart?"
        message="Are you sure you want to remove this item from your cart?"
        itemName={deleteModal.item?.name}
        confirmText="Remove"
        onConfirm={() => {
          if (deleteModal.item) {
            dispatch(removeFromCart({ id: deleteModal.item.id, weight: deleteModal.item.weight }));
          }
          setDeleteModal({ isOpen: false });
        }}
        onClose={() => setDeleteModal({ isOpen: false })}
      />
    </div>
  );
}

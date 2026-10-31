"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, ShieldCheck, Star, HelpCircle, Search, Copy, CheckCircle2 } from 'lucide-react';

interface OrderItem {
  name: string;
  weight: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderData {
  orderId: string;
  status: string;
  isDelivered?: boolean;
  isOutForDelivery?: boolean;
  deliveryPin: string;
  deliveryWindow?: string;
  countdown?: string;
  customer?: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totalPaid: number;
  paymentMethod: string;
  deliveryAddress: string;
  rider: string;
  deliveredAt?: string | null;
  receivedBy?: string | null;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('orderId') || searchParams.get('ref') || searchParams.get('id');
  const initialOrderId = orderParam || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialOrderId);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(orderParam));
  
  // Delivery PIN handover state
  const [inputPin, setInputPin] = useState<string>('');
  const [verifyingPin, setVerifyingPin] = useState<boolean>(false);
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const fetchTracking = async (orderIdToFetch: string) => {
    if (!orderIdToFetch.trim()) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setToastMessage(null);
    try {
      const cleanId = orderIdToFetch.replace(/^#/, '');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const res = await fetch(`${apiUrl}/orders/${encodeURIComponent(cleanId)}/track`);
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setOrder(null);
        setToastMessage({ text: 'Order not found. Please verify the order reference number.', type: 'error' });
      }
    } catch (err: any) {
      setOrder(null);
      setToastMessage({ text: err.message || 'Unable to fetch order tracking status.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderParam) {
      setSearchQuery(orderParam);
      fetchTracking(orderParam);
    } else {
      setLoading(false);
    }
  }, [orderParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchTracking(searchQuery.trim());
  };

  const handleCopyPin = () => {
    if (!order?.deliveryPin) return;
    navigator.clipboard?.writeText(order.deliveryPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !inputPin.trim()) return;

    setVerifyingPin(true);
    setToastMessage(null);

    try {
      const cleanId = order.orderId.replace(/^#/, '');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const res = await fetch(`${apiUrl}/orders/${encodeURIComponent(cleanId)}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryPin: inputPin.trim(),
          receivedBy: order.customer?.name || 'Customer',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMessage({
          text: data.message || 'Delivery confirmed successfully! Handover verified.',
          type: 'success',
        });
        // Transition order status to Delivered
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'Delivered',
                isDelivered: true,
                isOutForDelivery: false,
                deliveredAt: 'Today at ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                receivedBy: order.customer?.name || 'Customer',
              }
            : null
        );
      } else {
        throw new Error(data.message || 'Incorrect Delivery PIN.');
      }
    } catch (err: any) {
      setToastMessage({
        text: err.message || 'Invalid Delivery PIN. Please enter the 4-digit PIN from your confirmation.',
        type: 'error',
      });
    } finally {
      setVerifyingPin(false);
    }
  };

  const isDeliveredState = order?.status?.toLowerCase() === 'delivered' || order?.isDelivered;

  return (
    <div className="bg-[#fafafa] min-h-screen py-8 md:py-12 px-4 md:px-[5%] relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' ? 'bg-[#7A1A1A] text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{toastMessage.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Search Order Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#fdf5f5] text-[#7A1A1A] rounded-lg">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h3 className="m-0 text-sm font-bold text-gray-900">Track An Order</h3>
              <p className="m-0 text-xs text-gray-500">Enter your order reference to check live handover status</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="e.g. #CMZ-2026-8847"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#7A1A1A] animate-spin mb-3" />
            <p className="text-gray-500 text-sm font-medium">Fetching delivery status and credentials...</p>
          </div>
        ) : !order ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 text-sm mb-4">Please verify the order reference number you entered.</p>
          </div>
        ) : isDeliveredState ? (

          /* DELIVERED SCREEN matching Screenshot 5 */
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-gray-100 shadow-sm max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#e8f9ed] text-[#16a34a] flex items-center justify-center text-4xl mx-auto shadow-xs">
              ✓
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 m-0 mb-2">
                Your order has been delivered!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto m-0">
                Your premium butchery package was delivered on{' '}
                <strong className="text-gray-900">{order.deliveredAt || 'Recently'}</strong>{' '}
                and was handed over to <strong className="text-gray-900">{order.receivedBy || order.customer?.name || 'Customer'}</strong>.
              </p>
            </div>

            {/* Package Overview matching Screenshot 5 */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-6 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider m-0">
                Package Overview
              </h3>
              <div className="divide-y divide-gray-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={it.imageUrl || '/assets/images/placeholder.jpg'}
                        alt={it.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {it.weight || '1.0kg'} {it.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons matching Screenshot 5 */}
              <div className="pt-3 space-y-2.5">
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors uppercase tracking-wider shadow-sm"
                >
                  RATE YOUR ORDER
                </button>
                <a
                  href="https://wa.me/2340000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 cursor-pointer transition-colors uppercase tracking-wider block text-center no-underline"
                >
                  NEED HELP?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="text-xs text-[#7A1A1A] font-bold no-underline hover:underline"
              >
                &larr; Return to Carneiz Butchery Shop
              </Link>
            </div>
          </div>

        ) : (

          /* LIVE EN ROUTE TRACKING matching Screenshot 4 */
          <div className="space-y-8">
            
            {/* Header Card matching Screenshot 4 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[11px] font-black text-[#7A1A1A] tracking-wider uppercase block mb-1">
                    LIVE TRACKING
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 m-0">
                    Order {order.orderId}
                  </h1>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 font-semibold block mb-0.5">
                    Estimated Delivery Countdown
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#7A1A1A]">
                    {order.countdown || '45 minutes remaining'}
                  </span>
                </div>
              </div>

              {/* 3-Step Progress Bar matching Screenshot 4 */}
              <div className="pt-4 border-t border-gray-100">
                <div className="max-w-2xl mx-auto flex items-center justify-between relative">
                  
                  {/* Step 1: Processing (Completed) */}
                  <div className="flex items-center gap-2.5 z-10 bg-white pr-2">
                    <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">Processing</span>
                      <span className="text-[10px] text-gray-400 font-medium">Completed</span>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-[#16a34a] mx-2"></div>

                  {/* Step 2: Out for Delivery (Active) */}
                  <div className="flex items-center gap-2.5 z-10 bg-white px-2">
                    <div className="w-8 h-8 rounded-full bg-[#7A1A1A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      2
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">Out for Delivery</span>
                      <span className="text-[10px] text-[#7A1A1A] font-bold">In Progress</span>
                    </div>
                  </div>

                  <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>

                  {/* Step 3: Delivered (Pending) */}
                  <div className="flex items-center gap-2.5 z-10 bg-white pl-2">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 block leading-tight">Delivered</span>
                      <span className="text-[10px] text-gray-400 font-medium">Pending</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Main Grid: Left Map + Delivery PIN Input | Right Delivery Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (8 cols): Map Illustration & PIN Handover Box */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Normal Styled Map Section matching Screenshot 4 */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                  
                  {/* Styled Map Graphic mimicking Screenshot 4 city map with waterways and streets */}
                  <div className="w-full h-80 sm:h-96 relative bg-[#d6eef5] overflow-hidden">
                    <svg className="w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
                      {/* Water background */}
                      <rect width="600" height="400" fill="#cbe6ef" />
                      {/* Coastline / land masses */}
                      <path d="M 0,0 L 400,0 C 370,120 340,240 200,320 C 140,360 80,380 0,400 Z" fill="#ebf4ec" />
                      <path d="M 120,400 C 220,380 320,340 450,220 C 520,150 560,80 600,0 L 600,400 Z" fill="#ebf4ec" />
                      {/* City Blocks (sand & soft peach colors like screenshot) */}
                      <rect x="50" y="30" width="60" height="40" rx="6" fill="#fdebd0" />
                      <rect x="130" y="20" width="70" height="50" rx="6" fill="#f9e79f" />
                      <rect x="220" y="30" width="50" height="40" rx="6" fill="#fadbd8" />
                      <rect x="70" y="90" width="80" height="60" rx="6" fill="#d5f5e3" />
                      <rect x="170" y="90" width="90" height="55" rx="6" fill="#fdebd0" />
                      <rect x="80" y="170" width="70" height="50" rx="6" fill="#fadbd8" />
                      <rect x="170" y="160" width="60" height="70" rx="6" fill="#d5f5e3" />
                      
                      {/* Right bank city blocks */}
                      <rect x="360" y="30" width="80" height="50" rx="6" fill="#fdebd0" />
                      <rect x="460" y="20" width="100" height="60" rx="6" fill="#fadbd8" />
                      <rect x="380" y="100" width="70" height="70" rx="6" fill="#d5f5e3" />
                      <rect x="470" y="100" width="80" height="80" rx="6" fill="#f9e79f" />
                      <rect x="350" y="200" width="90" height="60" rx="6" fill="#fadbd8" />
                      <rect x="460" y="200" width="100" height="70" rx="6" fill="#d5f5e3" />
                      <rect x="300" y="280" width="120" height="80" rx="6" fill="#fdebd0" />
                      <rect x="440" y="290" width="110" height="70" rx="6" fill="#fadbd8" />

                      {/* Streets (white road grids) */}
                      <path d="M 0,80 Q 200,85 600,75" stroke="#ffffff" strokeWidth="8" fill="none" />
                      <path d="M 0,160 Q 200,150 600,180" stroke="#ffffff" strokeWidth="8" fill="none" />
                      <path d="M 0,250 Q 250,240 600,280" stroke="#ffffff" strokeWidth="8" fill="none" />
                      <path d="M 120,0 L 120,400" stroke="#ffffff" strokeWidth="7" fill="none" />
                      <path d="M 270,0 Q 280,200 240,400" stroke="#ffffff" strokeWidth="8" fill="none" />
                      <path d="M 370,0 L 370,400" stroke="#ffffff" strokeWidth="8" fill="none" />
                      <path d="M 460,0 L 460,400" stroke="#ffffff" strokeWidth="7" fill="none" />
                      
                      {/* Secondary streets */}
                      <path d="M 30,0 L 30,400" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.8" />
                      <path d="M 540,0 L 540,400" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.8" />
                    </svg>

                    {/* Top destination pill badge matching Screenshot 4 */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs py-2 px-4 rounded-full font-bold text-gray-900 flex items-center gap-2 shadow-md text-xs border border-gray-100">
                      <span className="text-[#7A1A1A]">📍</span>
                      <span>Delivering to {order.deliveryAddress || order.customer?.address || 'Customer Address'}</span>
                    </div>

                    {/* Blue Home Marker in center matching Screenshot 4 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative flex items-center justify-center">
                        <div className="w-14 h-14 bg-[#1e88e5] rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-pulse">
                          <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-2 w-4 h-2 bg-black/20 rounded-full blur-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Rider Info footer in Map */}
                  <div className="p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[#16a34a] font-bold">● Active Dispatch</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">Assigned Rider: <strong className="text-gray-900">{order.rider}</strong></span>
                    </div>
                    <span className="text-gray-500 font-medium">Standard Cold-Chain Express</span>
                  </div>
                </div>

                {/* Secret Customer Delivery PIN Handover Box (Crucial User Requirement) */}
                <div className="bg-white rounded-3xl border-2 border-[#7A1A1A]/20 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#7A1A1A]" />
                        <h3 className="m-0 text-base font-extrabold text-gray-900">
                          Confirm Delivery With PIN
                        </h3>
                      </div>
                      <p className="m-0 text-xs text-gray-500 mt-1">
                        When your Carneiz dispatch rider arrives, enter your secret delivery PIN below to confirm physical handover.
                      </p>
                    </div>

                    {/* Customer's PIN Display */}
                    <div className="bg-[#fdf5f5] border border-[#7A1A1A]/30 rounded-2xl px-5 py-2.5 text-center shrink-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        YOUR SECRET PIN
                      </span>
                      <div className="flex items-center gap-2 justify-center mt-0.5">
                        <span className="font-mono text-2xl font-black text-[#7A1A1A] tracking-widest">
                          {order.deliveryPin}
                        </span>
                        <button
                          onClick={handleCopyPin}
                          title="Copy PIN"
                          className="text-gray-400 hover:text-[#7A1A1A] bg-transparent border-none cursor-pointer p-0"
                        >
                          {copiedPin ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form to Input PIN and Mark as Delivered */}
                  <form onSubmit={handleConfirmDelivery} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Enter Secret Handover PIN
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 4-digit PIN"
                        value={inputPin}
                        onChange={(e) => setInputPin(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono font-bold text-lg tracking-widest outline-none focus:border-[#7A1A1A] focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingPin || !inputPin.trim()}
                      className="sm:mt-5 px-6 py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {verifyingPin ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>VERIFYING PIN...</span>
                        </>
                      ) : (
                        'CONFIRM HANDOVER'
                      )}
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column (4 cols): Delivery Breakdown matching Screenshot 4 */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm sticky top-24 space-y-6">
                  <h2 className="text-xl font-extrabold text-gray-900 m-0 pb-4 border-b border-gray-100">
                    Delivery Breakdown
                  </h2>

                  {/* Items matching Screenshot 4 */}
                  <div className="divide-y divide-gray-100 space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="pt-4 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.imageUrl || '/assets/images/placeholder.jpg'}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 m-0">{item.name}</h4>
                            <span className="text-[11px] text-gray-500 block mt-0.5">
                              {item.weight || '1.0 kg'} • Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-900 shrink-0">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-5 space-y-3.5 text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Total Paid</span>
                      <strong className="text-base text-gray-900">
                        ₦{order.totalPaid.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Paid Via</span>
                      <strong className="text-gray-900">{order.paymentMethod}</strong>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-semibold">Status</span>
                      <span className="bg-[#fcedec] text-[#7A1A1A] font-black text-[11px] px-3 py-1 rounded-md tracking-wider uppercase">
                        EN ROUTE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Experience</h3>
            <p className="text-xs text-gray-500 mb-6">How was the cut tenderness and chilled delivery service?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`text-3xl cursor-pointer bg-transparent border-none p-1 transition-transform hover:scale-110 ${
                    rating >= s ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowRatingModal(false);
                setToastMessage({ text: 'Thank you for your rating!', type: 'success' });
              }}
              className="w-full py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

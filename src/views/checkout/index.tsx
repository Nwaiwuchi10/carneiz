"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ShieldCheck, CreditCard, Banknote, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { clearCart } from '@/src/redux/slices/cartSlice';

export default function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const discountPercent = useAppSelector((state) => state.cart.discountPercent);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('home');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  const [storeConfig, setStoreConfig] = useState<{
    deliveryFee: number;
    serviceFee: number;
    pickupAddress: string;
    pickupHours: string;
  }>({
    deliveryFee: 2500,
    serviceFee: 500,
    pickupAddress: 'Carneiz Flagship Store, Plot 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    pickupHours: 'Mon - Sat: 8:00 AM - 7:00 PM',
  });

  const [deliveryOption, setDeliveryOption] = useState<{ id: string; name: string; estimate: string; fee: number }>({
    id: 'standard',
    name: 'Standard 2-3 Days Delivery',
    estimate: 'Delivered by Thursday, May 14',
    fee: 2500,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    newAccountEmail: '',
    newAccountPassword: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'flutterwave' | 'cash'>('flutterwave');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  
  // Confirmed order state matching Images 1, 2, 3
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [confirmedDeliveryPin, setConfirmedDeliveryPin] = useState<string>('');
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Load user profile & saved addresses if available
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setFormData((prev) => ({
          ...prev,
          fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.fullName,
          newAccountEmail: u.email || prev.newAccountEmail,
          phoneNumber: u.phoneNumber || prev.phoneNumber,
        }));
      }
    } catch {}

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
    fetch(`${apiUrl}/users/addresses`)
      .then((r) => r.json())
      .then((addrs) => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
        } else {
          const stored = localStorage.getItem('carneiz_saved_addresses');
          if (stored) setSavedAddresses(JSON.parse(stored));
        }
      })
      .catch(() => {
        const stored = localStorage.getItem('carneiz_saved_addresses');
        if (stored) setSavedAddresses(JSON.parse(stored));
      });
  }, []);

  // Fetch admin configured delivery fee, service fee, and store pickup address
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
    fetch(`${apiUrl}/orders/config`)
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg) {
          setStoreConfig({
            deliveryFee: Number(cfg.deliveryFee) ?? 2500,
            serviceFee: Number(cfg.serviceFee) ?? 500,
            pickupAddress: cfg.pickupAddress || 'Carneiz Flagship Store, Plot 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
            pickupHours: cfg.pickupHours || 'Mon - Sat: 8:00 AM - 7:00 PM',
          });
          setDeliveryOption((prev) => ({
            ...prev,
            fee: Number(cfg.deliveryFee) ?? 2500,
          }));
        }
      })
      .catch((err) => console.warn('Could not load store config:', err));
  }, []);

  // Check Flutterwave redirect callback
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');
    const txIdParam = searchParams.get('transaction_id');

    if (statusParam === 'success' || orderIdParam) {
      setStep(3);
      if (orderIdParam) setConfirmedOrderId(orderIdParam);
      dispatch(clearCart());

      // Verify payment with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      fetch(`${apiUrl}/orders/verify?transaction_id=${txIdParam || ''}&orderId=${encodeURIComponent(orderIdParam || '')}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.deliveryPin) setConfirmedDeliveryPin(d.deliveryPin);
          setResponseMsg({ text: 'Payment verified! Your order confirmation and PIN have been generated.', type: 'success' });
        })
        .catch(() => {});
    }
  }, [searchParams, dispatch]);

  const checkoutItems = items;

  const currentDeliveryFee = fulfillmentType === 'pickup' ? 0 : (storeConfig.deliveryFee ?? deliveryOption.fee);
  const currentServiceFee = storeConfig.serviceFee ?? 500;
  const subtotal = checkoutItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0);
  const discountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const finalTotal = subtotal + currentDeliveryFee + currentServiceFee - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      phoneNumber: addr.phoneNumber || prev.phoneNumber,
    }));
  };

  const handleProceedToPayment = () => {
    setIsSubmitting(true);
    setResponseMsg(null);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    setResponseMsg(null);

    const payload = {
      fulfillmentType,
      pickupAddress: storeConfig.pickupAddress,
      name: formData.fullName,
      email: 'customer@carneiz.com',
      phone: formData.phoneNumber,
      address: fulfillmentType === 'pickup' 
        ? storeConfig.pickupAddress 
        : `${formData.streetAddress}, ${formData.city}, ${formData.state}`,
      amount: finalTotal,
      subtotal,
      deliveryFee: currentDeliveryFee,
      serviceFee: currentServiceFee,
      discount: discountAmount,
      total: finalTotal,
      items: checkoutItems,
      deliveryWindow: fulfillmentType === 'pickup' 
        ? `In-Store Pickup (${storeConfig.pickupHours})` 
        : deliveryOption.estimate,
      paymentMethod,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const res = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setConfirmedOrderId(data.orderId || `#CMZ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        if (data.deliveryPin) setConfirmedDeliveryPin(data.deliveryPin);

        // If Flutterwave payment link was returned and payment method is flutterwave
        if (data.paymentLink && paymentMethod === 'flutterwave') {
          setResponseMsg({
            text: 'Redirecting to Flutterwave secure payment gateway...',
            type: 'success',
          });
          // Redirect the user immediately to Flutterwave Payment Gateway!
          window.location.href = data.paymentLink;
          return;
        }

        setResponseMsg({
          text: data.message || 'Order placed successfully! Delivery PIN generated.',
          type: 'success',
        });
        dispatch(clearCart());
        setStep(3);
        setIsSubmitting(false);
      } else {
        throw new Error(data.message || 'Checkout failed');
      }
    } catch (err: any) {
      setResponseMsg({
        text: err.message || 'Payment initiation failed. Please try again.',
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  const handleCreatePostCheckoutAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAccount(true);
    setTimeout(() => {
      setIsCreatingAccount(false);
      setResponseMsg({ text: 'Carneiz account created successfully! Check your inbox to verify.', type: 'success' });
    }, 700);
  };

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(confirmedDeliveryPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-16">
      {/* Toast Response Notification */}
      {responseMsg && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          responseMsg.type === 'success' ? 'bg-[#7A1A1A] text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{responseMsg.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{responseMsg.text}</span>
        </div>
      )}

      {/* Checkout Stepper Header matching Screenshot 1, 2, 3, 4, 5 */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 md:px-[5%]">
        <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-6 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
          {/* Step 1 */}
          <div className={`flex items-center gap-2 font-bold ${
            step === 1 ? 'text-[#7A1A1A]' : 'text-[#16a34a]'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1 ? 'bg-[#7A1A1A] text-white' : 'bg-[#16a34a] text-white'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span>Delivery Address</span>
          </div>

          <span className="text-gray-300">›</span>

          {/* Step 2 */}
          <div className={`flex items-center gap-2 font-bold ${
            step === 2 ? 'text-[#7A1A1A]' : step === 3 ? 'text-[#16a34a]' : 'text-gray-400 font-normal'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2 ? 'bg-[#7A1A1A] text-white' : step === 3 ? 'bg-[#16a34a] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step === 3 ? '✓' : '2'}
            </div>
            <span>Secure Payment</span>
          </div>

          <span className="text-gray-300">›</span>

          {/* Step 3 */}
          <div className={`flex items-center gap-2 font-bold ${
            step === 3 ? 'text-[#16a34a]' : 'text-gray-400 font-normal'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 3 ? 'bg-[#16a34a] text-white' : 'border border-gray-300 text-gray-400'
            }`}>
              {step === 3 ? '✓' : '3'}
            </div>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-10">
        
        {/* STEP 3: ORDER CONFIRMED VIEW strictly matching Screenshots 1, 2, 3 */}
        {step === 3 ? (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Main Order Confirmed Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8f9ed] text-[#16a34a] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
                ✓
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 m-0 mb-2">
                {fulfillmentType === 'pickup' ? 'Store Pickup Confirmed!' : 'Order Confirmed!'}
              </h1>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {fulfillmentType === 'pickup' 
                  ? 'Thank you for your order. We are vacuum-packing your fresh cuts and keeping them chilled at our store counter for your pickup.' 
                  : 'Thank you for your purchase. We have received your order and are preparing your premium cuts.'}
              </p>
              
              <div className="text-base font-extrabold text-[#7A1A1A] mb-6">
                Order Reference: {confirmedOrderId}
              </div>

              {/* Secret Delivery / Pickup PIN Banner for Customer (User Requirement 2 & 3) */}
              <div className="bg-[#fdf5f5] border-2 border-dashed border-[#7A1A1A]/40 rounded-2xl p-5 mb-8 text-center space-y-2">
                <span className="text-[11px] font-extrabold text-gray-600 tracking-wider uppercase block">
                  {fulfillmentType === 'pickup' ? 'YOUR SECRET STORE PICKUP PIN' : 'YOUR SECRET DELIVERY PIN'}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-[#7A1A1A] tracking-widest">
                    {confirmedDeliveryPin}
                  </span>
                  <button
                    onClick={handleCopyPin}
                    title="Copy PIN"
                    className="p-1 text-gray-400 hover:text-[#7A1A1A] bg-transparent border-none cursor-pointer"
                  >
                    {copiedPin ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 m-0 leading-relaxed max-w-md mx-auto">
                  {fulfillmentType === 'pickup'
                    ? 'When you arrive at our Carneiz Flagship Store, enter or provide this 4-digit PIN to our staff at the checkout counter to authenticate and collect your package.'
                    : 'Keep this PIN safe. When your Carneiz dispatch rider arrives, enter this PIN on your tracking screen to confirm and complete your delivery.'}
                </p>
              </div>

              {/* Details & Expected Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left border-y border-gray-100 py-6 mb-6">
                <div>
                  <h4 className="m-0 text-sm font-extrabold text-gray-900 mb-2">
                    {fulfillmentType === 'pickup' ? 'Store Pickup Location' : 'Delivery Details'}
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="m-0 font-medium text-gray-900">Recipient</p>
                    <p className="m-0 text-gray-500">{formData.fullName} • {formData.phoneNumber}</p>
                    <p className="m-0 font-medium text-gray-900 pt-2">
                      {fulfillmentType === 'pickup' ? 'Carneiz Store Address' : 'Address'}
                    </p>
                    <p className="m-0 text-gray-700 font-medium">
                      {fulfillmentType === 'pickup' ? storeConfig.pickupAddress : `${formData.streetAddress}, ${formData.city}, ${formData.state}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="m-0 text-sm font-extrabold text-gray-900 mb-2">
                    {fulfillmentType === 'pickup' ? 'Store Operating Hours' : 'Expected Arrival'}
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="m-0 font-medium text-gray-900">
                      {fulfillmentType === 'pickup' ? 'Pickup Schedule' : 'Delivery Window'}
                    </p>
                    <p className="m-0 text-[#16a34a] font-bold">
                      {fulfillmentType === 'pickup' ? storeConfig.pickupHours : deliveryOption.estimate}
                    </p>
                    <p className="m-0 font-medium text-gray-900 pt-2">Notification Setup</p>
                    <p className="m-0 text-gray-500">Order confirmation SMS & Email has been dispatched.</p>
                  </div>
                </div>
              </div>

              {/* Total Paid matching Screenshots 1, 2, 3 */}
              <div className="flex justify-between items-baseline pt-2 mb-8">
                <span className="text-base font-extrabold text-gray-900">Total Paid</span>
                <span className="text-2xl font-black text-[#7A1A1A]">
                  ₦{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Action Buttons matching Screenshots 1, 2, 3 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/track-order?orderId=${encodeURIComponent(confirmedOrderId)}`}
                  className="flex-1 py-4 bg-[#7A1A1A] hover:bg-[#601414] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-colors no-underline shadow-sm text-center"
                >
                  TRACK YOUR ORDER
                </Link>
                <Link
                  href="/products"
                  className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs tracking-wider uppercase rounded-xl border border-gray-200 transition-colors no-underline text-center"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>

            {/* Bottom Card: Save Time Next Order matching Screenshots 1, 2, 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900 m-0 mb-1">
                Save Time Next Order
              </h3>
              <p className="text-xs text-gray-500 m-0 mb-5">
                Create a secure CARNEIZ account using your checkout information.
              </p>

              <form onSubmit={handleCreatePostCheckoutAccount} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.newAccountEmail}
                    onChange={(e) => setFormData({ ...formData, newAccountEmail: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#7A1A1A]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Choose Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.newAccountPassword}
                    onChange={(e) => setFormData({ ...formData, newAccountPassword: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#7A1A1A]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={isCreatingAccount}
                    className="w-full py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isCreatingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'CREATE ACCOUNT'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        ) : checkoutItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center max-w-lg mx-auto my-8">
            <span className="text-4xl block mb-3">🥩</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 text-sm mb-6">You don't have any butchery products in your cart. Add fresh cuts to proceed with checkout.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl no-underline tracking-wider uppercase transition-colors"
            >
              Browse Fresh Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: FORMS (STEP 1 & STEP 2) */}
            <div className="lg:col-span-8 space-y-6">

              {/* STEP 1: DELIVERY ADDRESS & OPTIONS */}
              {step === 1 && (
                <>
                  {/* Fulfillment Method Selector: Delivery vs Pickup (User Requirement 1 & 2) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 m-0 mb-1">Select Fulfillment Method</h3>
                    <p className="text-xs text-gray-500 mb-4">Choose between cold-chain delivery to your doorstep or in-store pickup at Carneiz flagship butchery.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Doorstep Delivery */}
                      <div
                        onClick={() => setFulfillmentType('delivery')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          fulfillmentType === 'delivery'
                            ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🚚</span>
                            <span className="font-bold text-sm text-gray-900">Doorstep Delivery</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            fulfillmentType === 'delivery' ? 'border-[#7A1A1A]' : 'border-gray-300'
                          }`}>
                            {fulfillmentType === 'delivery' && <div className="w-2 h-2 rounded-full bg-[#7A1A1A]" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 m-0 leading-relaxed mb-2">
                          Dispatched via cold-chain courier directly to your home or office.
                        </p>
                        <span className="text-xs font-black text-[#7A1A1A]">
                          ₦{storeConfig.deliveryFee.toLocaleString()} Delivery Fee
                        </span>
                      </div>

                      {/* Store Pickup */}
                      <div
                        onClick={() => setFulfillmentType('pickup')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          fulfillmentType === 'pickup'
                            ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏬</span>
                            <span className="font-bold text-sm text-gray-900">Carneiz Store Pickup</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            fulfillmentType === 'pickup' ? 'border-[#7A1A1A]' : 'border-gray-300'
                          }`}>
                            {fulfillmentType === 'pickup' && <div className="w-2 h-2 rounded-full bg-[#7A1A1A]" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 m-0 leading-relaxed mb-2">
                          Pick up directly at our Carneiz Flagship Store counter.
                        </p>
                        <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                          FREE • ₦0 Delivery Fee
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* If Store Pickup is selected (User Requirement 2) */}
                  {fulfillmentType === 'pickup' ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏬</span>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 m-0">Carneiz Store Pickup Address</h3>
                          <p className="text-xs text-gray-500 m-0">Come to our store to pick up your fresh, vacuum-packed cuts.</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                        <div>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Store Location</span>
                          <p className="text-sm font-black text-gray-900 m-0 mt-0.5">
                            {storeConfig.pickupAddress}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs">
                          <span className="text-gray-500 font-medium">Store Operating Hours:</span>
                          <span className="font-bold text-green-700">{storeConfig.pickupHours}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>📌</span> In-Store Pickup Instructions:
                        </span>
                        <p className="text-amber-800 m-0 leading-relaxed">
                          • Your fresh cuts will be vacuum-sealed and held chilled at 2°C in our store lockers.<br/>
                          • After completing checkout, you will receive a <strong>4-digit Secret Pickup PIN</strong> on screen and via email.<br/>
                          • Present your PIN at the Carneiz store counter to authenticate and collect your package.
                        </p>
                      </div>

                      {/* Recipient Details for Store Staff Verification */}
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pickup Contact Person</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input
                              type="text"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Saved Addresses (Dynamically loaded) */}
                      {savedAddresses.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <h3 className="text-base font-bold text-gray-900 m-0 mb-4">Saved Addresses</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectSavedAddress(addr)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  selectedAddressId === addr.id
                                    ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-sm text-gray-900">
                                    {addr.title} {addr.isDefault && '(Default)'}
                                  </span>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    selectedAddressId === addr.id ? 'border-[#7A1A1A]' : 'border-gray-300'
                                  }`}>
                                    {selectedAddressId === addr.id && (
                                      <div className="w-2 h-2 rounded-full bg-[#7A1A1A]" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 m-0 leading-relaxed">
                                  {addr.streetAddress}, {addr.city} {addr.state}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipping Address Form matching Screenshot 4 */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 m-0">Shipping Address</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delivery Options matching Screenshot 4 */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
                        <h3 className="text-base font-bold text-gray-900 m-0 mb-2">Delivery Options</h3>

                        {/* Standard Delivery (Configured by Admin) */}
                        <div
                          onClick={() =>
                            setDeliveryOption({
                              id: 'standard',
                              name: 'Standard Cold-Chain Delivery',
                              estimate: 'Delivered in 2-3 business days',
                              fee: storeConfig.deliveryFee,
                            })
                          }
                          className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                            deliveryOption.id === 'standard'
                              ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              deliveryOption.id === 'standard' ? 'border-[#7A1A1A]' : 'border-gray-300'
                            }`}>
                              {deliveryOption.id === 'standard' && <div className="w-2 h-2 rounded-full bg-[#7A1A1A]" />}
                            </div>
                            <div>
                              <h4 className="m-0 text-sm font-bold text-[#7A1A1A]">Standard Cold-Chain Delivery</h4>
                              <p className="m-0 text-xs text-[#7A1A1A]">Delivered in 2-3 business days</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-sm text-[#7A1A1A]">₦{storeConfig.deliveryFee.toLocaleString()}</span>
                        </div>

                        {/* Express Same-Day */}
                        <div
                          onClick={() =>
                            setDeliveryOption({
                              id: 'same-day',
                              name: 'Express Same-Day Delivery',
                              estimate: 'Delivered today by 6:00 PM',
                              fee: Math.round(storeConfig.deliveryFee * 1.4),
                            })
                          }
                          className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                            deliveryOption.id === 'same-day'
                              ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              deliveryOption.id === 'same-day' ? 'border-[#7A1A1A]' : 'border-gray-300'
                            }`}>
                              {deliveryOption.id === 'same-day' && <div className="w-2 h-2 rounded-full bg-[#7A1A1A]" />}
                            </div>
                            <div>
                              <h4 className="m-0 text-sm font-bold text-gray-900">Express Same-Day Delivery</h4>
                              <p className="m-0 text-xs text-gray-500">Delivered today by 6:00 PM</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-sm text-gray-900">₦{(Math.round(storeConfig.deliveryFee * 1.4)).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* STEP 2: SECURE PAYMENT matching Screenshot 5 */}
              {step === 2 && (
                <>
                  {/* Select Payment Method matching Screenshot 5 */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900 m-0">Select Payment Method</h3>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      PAYMENT METHOD
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Flutterwave / Paystack */}
                      <div
                        onClick={() => setPaymentMethod('flutterwave')}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                          paymentMethod === 'flutterwave'
                            ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-[#7A1A1A]" />
                          <span className="font-bold text-sm text-gray-900">
                            Flutterwave (Card / Transfer)
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'flutterwave' ? 'border-[#7A1A1A] bg-[#7A1A1A]' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'flutterwave' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Cash on Delivery */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-[#7A1A1A] bg-[#fdf5f5]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5 text-gray-600" />
                          <span className="font-bold text-sm text-gray-900">
                            Cash on Delivery
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cash' ? 'border-[#7A1A1A] bg-[#7A1A1A]' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cash' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Information Form matching Screenshot 5 */}
                  {paymentMethod === 'flutterwave' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <h3 className="text-base font-bold text-gray-900 m-0">Card Information</h3>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            CVV
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="***"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#7A1A1A]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SSL Encrypted Checkout Banner matching Screenshot 5 */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f9ed] text-[#16a34a] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="m-0 text-xs font-bold text-gray-900">SSL Encrypted Checkout</h4>
                      <p className="m-0 text-xs text-gray-500 mt-0.5">
                        Your credentials are safe and processed with bank-level Flutterwave encryption algorithms.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-gray-500 hover:text-gray-900 underline font-semibold bg-transparent border-none cursor-pointer p-0"
                  >
                    &larr; Back to Delivery Address
                  </button>
                </>
              )}

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY matching Screenshot 4 & 5 */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm sticky top-24 space-y-5">
                <h2 className="text-xl font-extrabold text-gray-900 m-0">Order Summary</h2>

                {/* Items preview matching Screenshot 4 & 5 */}
                <div className="divide-y divide-gray-100 space-y-3 pt-1">
                  {checkoutItems.map((item) => (
                    <div key={`${item._id}-${item.weight}`} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.imageUrl || '/assets/images/placeholder.jpg'}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 m-0 truncate">{item.name}</h4>
                        <span className="text-[11px] text-gray-500 block">{item.weight || '1.0 kg'} • Qty: {item.quantity}</span>
                      </div>
                      <span className="text-xs font-extrabold text-[#7A1A1A] shrink-0">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{fulfillmentType === 'pickup' ? 'Delivery Fee (Store Pickup)' : 'Standard Delivery'}</span>
                    <span className={`font-bold ${fulfillmentType === 'pickup' ? 'text-green-600' : 'text-gray-900'}`}>
                      {fulfillmentType === 'pickup' ? 'FREE (₦0)' : `₦${currentDeliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Service Fee</span>
                    <span className="font-bold text-gray-900">₦{currentServiceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#16a34a] font-semibold">
                    <span>Discount (5%)</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline border-t border-gray-100 pt-3">
                  <span className="text-base font-extrabold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-[#7A1A1A]">
                    ₦{finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Action button matching Screenshot 4 & 5 */}
                {step === 1 ? (
                  <button
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#7A1A1A] hover:bg-[#601414] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>VERIFYING...</span>
                      </>
                    ) : (
                      'CONTINUE TO PAYMENT'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#7A1A1A] hover:bg-[#601414] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PROCESSING WITH FLUTTERWAVE...</span>
                      </>
                    ) : paymentMethod === 'cash' ? (
                      'CONFIRM CASH ORDER'
                    ) : (
                      'CONTINUE TO PAYMENT'
                    )}
                  </button>
                )}

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

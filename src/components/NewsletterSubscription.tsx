"use client";

import React, { useState } from 'react';
import { CARNEIZ_CONTACT } from '@/src/constants/contactInfo';
import { newsletterService } from '@/src/services/newsletter.service';
import { MessageCircle, CheckCircle2, Loader2, Copy, Check } from 'lucide-react';

export default function NewsletterSubscription({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [discountCode, setDiscountCode] = useState('CARNEIZ10');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = CARNEIZ_CONTACT.phone.replace(/[^0-9]/g, '');

    const waText = [
      `*10% Off First Order Claim - Carneiz*`,
      `------------------------------------`,
      `📧 *Email:* ${cleanEmail}`,
      `🎁 *Offer:* 10% Off First Order`,
      `🎟️ *Coupon Code:* CARNEIZ10`,
      `------------------------------------`,
      `Hello Carneiz! I just subscribed to your mailing list with my email (${cleanEmail}). Please confirm my 10% discount for my order!`,
    ].join('\n');

    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    setWhatsappUrl(waLink);

    try {
      const res = await newsletterService.subscribe(cleanEmail);
      if (res?.discountCode) {
        setDiscountCode(res.discountCode);
      }
      setSubscribed(true);

      // Sync and launch the company WhatsApp line
      if (typeof window !== 'undefined') {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      // Even if network fails, still give the user their discount and sync to WhatsApp!
      setSubscribed(true);
      if (typeof window !== 'undefined') {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSubscribed(false);
    setEmail('');
    setErrorMessage(null);
  };

  return (
    <div className={`bg-[#fdf9f9] text-center py-10 md:py-12 px-4 md:px-[5%] border-b border-gray-100 ${className}`}>
      <div className="max-w-[620px] mx-auto">
        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 m-0 mb-2 tracking-tight">
          Get 10% Off Your First Order
        </h3>
        <p className="text-gray-500 m-0 mb-6 text-xs md:text-sm leading-relaxed max-w-[480px] mx-auto">
          Join our mailing list for exclusive offers, updates, and new product announcements.
        </p>

        {subscribed ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-7 shadow-xs text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-gray-900 font-bold text-lg m-0 mb-1">
              You're on the list!
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm m-0 mb-4 max-w-md mx-auto leading-relaxed">
              Your email <strong className="text-gray-900">{email}</strong> was captured on our backend and synced with the company WhatsApp line (<strong>{CARNEIZ_CONTACT.formattedPhone}</strong>).
            </p>

            {/* Discount Code Box */}
            <div className="inline-flex items-center gap-2.5 bg-gray-50 border-2 border-dashed border-[#8B1919] px-4 py-2.5 rounded-xl mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code:</span>
              <span className="font-mono font-black text-lg text-[#8B1919] tracking-wider">{discountCode}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-[#8B1919] hover:bg-[#6b1010] text-white p-1.5 rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors ml-1"
                title="Copy coupon code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-3 px-5 rounded-xl no-underline shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Claim 10% on WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer underline py-2"
              >
                Subscribe another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-center max-w-[500px] mx-auto w-full gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your email address"
                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm md:text-base outline-none transition-all duration-200 focus:border-[#8B1919] focus:ring-1 focus:ring-[#8B1919] bg-white shadow-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#8B1919] hover:bg-[#6b1010] disabled:bg-[#8B1919]/70 text-white border-none py-3 px-6 text-sm font-bold tracking-wider rounded-xl cursor-pointer transition-colors duration-200 whitespace-nowrap shadow-xs flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SUBSCRIBING...</span>
                  </>
                ) : (
                  <span>SUBSCRIBE</span>
                )}
              </button>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-xs m-0 text-center font-medium">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-1">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
              <span>Syncs automatically with our WhatsApp support line ({CARNEIZ_CONTACT.formattedPhone})</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AccountLayout from '@/src/components/Account/AccountLayout';

export default function AccountReviewsView() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('carneiz_user_reviews');
      if (stored) {
        setReviews(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <AccountLayout activeTab="reviews">
      <div className="space-y-6">
        
        {/* Header summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 m-0">Your Product Reviews</h2>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Share feedback about meat cut tenderness and flavor to help other foodies.</p>
          </div>
          <Link
            href="/account/orders"
            className="px-5 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl no-underline tracking-wider uppercase shadow-xs transition-colors"
          >
            Review Recent Order
          </Link>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <span className="text-4xl block mb-3">⭐</span>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Product Reviews Yet</h3>
            <p className="text-gray-500 text-xs max-w-md mx-auto mb-6">
              You haven't reviewed any purchased products yet. Go to your recent orders to write feedback and rate cuts you enjoyed.
            </p>
            <Link
              href="/account/orders"
              className="inline-block px-6 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white text-xs font-bold rounded-xl no-underline tracking-wider uppercase transition-colors"
            >
              Go to Order History
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">{rev.productName}</h3>
                    <span className="text-xs text-gray-400 font-medium">Reviewed on {rev.date}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    rev.status === 'Approved' ? 'bg-[#e6f7ec] text-[#16a34a]' : 'bg-[#fff5eb] text-amber-700'
                  }`}>
                    {rev.status || 'Pending Moderation'}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 text-base">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed m-0 font-medium">
                  "{rev.comment}"
                </p>

                {/* Photo Preview if uploaded */}
                {rev.photo && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                    <img src={rev.photo} alt="Review attachment" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}

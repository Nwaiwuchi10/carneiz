import React from 'react';
import { Truck, ShieldCheck, Lock, Check } from 'lucide-react';

const desktopFeatures = [
  { icon: '🚚', title: 'Nationwide Delivery', desc: 'Fast delivery anywhere' },
  { icon: '🛡️', title: 'Certified & Trusted', desc: 'Premium quality cuts' },
  { icon: '💳', title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: '⭐', title: 'Quality Guarantee', desc: 'Satisfaction guaranteed' },
];

const mobileFeatures = [
  {
    icon: <Truck className="w-5 h-5 text-[#E5A93C] stroke-[1.8]" />,
    title: 'Nationwide Delivery',
    desc: 'Speedy delivery to major hubs'
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#E5A93C] stroke-[1.8]" />,
    title: 'Certified & Trusted',
    desc: 'Fully vetted health standards'
  },
  {
    icon: <Lock className="w-5 h-5 text-[#E5A93C] stroke-[1.8]" />,
    title: 'Secure Payments',
    desc: '100% encrypted checkout'
  },
  {
    icon: <Check className="w-5 h-5 text-[#E5A93C] stroke-[2.8]" />,
    title: 'Quality Guarantee',
    desc: 'Fresh vacuum-sealed cuts'
  },
];

export default function Features() {
  return (
    <section className="py-8 md:py-12 px-5 md:px-[5%] bg-white border-t border-gray-100">
      {/* Mobile Stacked Features (Matching slice_lists_actual.png) */}
      <div className="flex flex-col gap-5 md:hidden">
        {mobileFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#121212] border border-[#2a2a2a] flex items-center justify-center shrink-0 shadow-sm">
              {f.icon}
            </div>
            <div>
              <h4 className="m-0 text-gray-900 text-sm font-bold">{f.title}</h4>
              <p className="m-0 text-gray-400 text-xs mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Features (Untouched) */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {desktopFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fff5f5] flex items-center justify-center shrink-0">
              <span className="text-2xl text-[#8B1919]">{f.icon}</span>
            </div>
            <div>
              <h4 className="m-0 text-gray-900 text-base font-bold mb-1">{f.title}</h4>
              <p className="m-0 text-gray-500 text-sm">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
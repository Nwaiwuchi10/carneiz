"use client";

import React, { useState } from 'react';

const mobileFaqs = [
  {
    question: "How long does delivery take?",
    answer: "We offer same-day delivery within Owerri for orders placed before 11:00 AM. Orders placed after 11:00 AM are delivered the following day. Delivery across Imo State takes between 2 to 6 hours depending on your exact location."
  },
  {
    question: "What formats are the meats delivered in?",
    answer: "All meats are professionally clean-cut, vacuum-sealed in food-grade packs, and shipped in chilled insulated containers to preserve freshness."
  },
  {
    question: "Can I schedule a specific delivery time?",
    answer: "Yes, you can specify your preferred delivery window during checkout or contact customer support immediately after ordering."
  },
  {
    question: "Do you deliver outside of Owerri & Imo State?",
    answer: "Yes, we deliver to Port Harcourt, Abuja, Lagos, and other major cities across Nigeria using chilled cold-chain logistics."
  }
];

const desktopFaqs = [
  { question: "How long does delivery take?", answer: "Delivery within Owerri and Imo State takes same-day or 24 hours. Deliveries to other states may take between 2-5 working days depending on the location." },
  { question: "Are the spices mixed with any additives?", answer: "No, our spices are 100% natural, locally sourced, and processed without any artificial additives or preservatives." },
  { question: "Can I order in large quantities for events?", answer: "Yes, you can order in bulk for events by clicking the 'BUY IN BULK' button on our hero section or contacting us directly." },
  { question: "Do you deliver frozen meats?", answer: "Yes, all our meats are vacuum-sealed and cold-chain delivered to ensure maximum freshness." }
];

export default function FAQ() {
  const [mobileOpenIndex, setMobileOpenIndex] = useState<number | null>(0);
  const [desktopOpenIndex, setDesktopOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-8 md:py-16 px-4 md:px-[5%] bg-white max-w-3xl mx-auto">
      {/* Mobile FAQ (Matching slice_map_actual.png) */}
      <div className="block md:hidden">
        <h2 className="text-sm font-black text-gray-900 text-center uppercase tracking-wider mb-6">FAQ</h2>
        <div className="flex flex-col gap-3">
          {mobileFaqs.map((faq, index) => {
            const isOpen = mobileOpenIndex === index;
            return (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                <button
                  className="w-full text-left p-4 bg-white border-none flex justify-between items-center cursor-pointer text-xs sm:text-sm font-bold text-gray-900 gap-3"
                  onClick={() => setMobileOpenIndex(isOpen ? null : index)}
                >
                  <span className="leading-snug">{faq.question}</span>
                  <span className="text-lg text-gray-600 font-light shrink-0 ml-2">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-gray-500 text-xs leading-relaxed border-t border-gray-50">
                    <p className="m-0">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop FAQ (Untouched) */}
      <div className="hidden md:block">
        <h2 className="text-3xl font-bold text-gray-900 text-center m-0 mb-10">FAQ</h2>
        <div className="flex flex-col gap-4">
          {desktopFaqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
              <button 
                className={`w-full text-left p-5 bg-white border-none flex justify-between items-center cursor-pointer text-base font-semibold text-gray-800 transition-colors duration-200 hover:text-[#8B1919] ${desktopOpenIndex === index ? 'text-[#8B1919]' : ''}`}
                onClick={() => setDesktopOpenIndex(desktopOpenIndex === index ? null : index)}
              >
                {faq.question}
                <span className="text-xl text-[#8B1919] font-normal leading-none shrink-0 ml-4">{desktopOpenIndex === index ? '−' : '+'}</span>
              </button>
              {desktopOpenIndex === index && (
                <div className="p-5 pt-0 text-gray-600 leading-relaxed bg-white border-t border-gray-100 mt-0">
                  <p className="m-0 mt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
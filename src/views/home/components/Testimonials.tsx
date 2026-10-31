import React from 'react';

const testimonials = [
  {
    name: "Olaniyi Olakunle",
    location: "Lekki, Lagos",
    text: "The best meat I've ever tasted! Perfectly fresh, premium butcher cuts and delivered on time right to my doorstep.",
    rating: 5,
    image: "https://www.carneiz.org/images/bobby.jpg",
  },
  {
    name: "Onuigbo Victoria",
    location: "Wuse, Abuja",
    text: "Fantastic quality and flavor! The hand-blended spices and tender cuts brought authentic Nigerian taste to every meal. Highly recommended!",
    rating: 5,
    image: "https://www.carneiz.org/images/vicky.jpg",
  },
  {
    name: "Chioma Okafor",
    location: "GRA, Port Harcourt",
    text: "Great customer service and exceptionally fresh ingredients. The vacuum-sealed cold packaging exceeded my expectations!",
    rating: 5,
    image: "https://www.carneiz.org/images/rachael.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-10 md:py-16 px-4 md:px-[5%] bg-white md:bg-[#f4f7f6]">
      {/* Section Header */}
      <div className="text-center mb-8 md:mb-12">
        <span className="text-xs font-bold text-[#8B1919] uppercase tracking-wider block mb-1">
          Real Stories, Real Flavor
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 m-0 mb-2">
          What Our Customers Say
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm m-0 max-w-md mx-auto">
          Hear from households and chefs enjoying authentic farm-fresh cuts and local spices
        </p>
      </div>

      {/* Testimonials Grid (Responsive for Mobile and Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div>
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <svg
                  className="w-8 h-8 text-[#8B1919] fill-current opacity-20"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                {/* 5 Star Rating */}
                <div className="flex gap-1 text-amber-400 text-sm">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed m-0 mb-6 font-normal italic">
                "{t.text}"
              </p>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100">
              <img
                src={t.image}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[#8B1919]/10 shadow-xs"
                loading="lazy"
              />
              <div>
                <h4 className="m-0 text-gray-900 text-sm font-bold leading-tight">
                  {t.name}
                </h4>
                <span className="text-xs text-gray-400 block mt-0.5">
                  {t.location}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  Verified Buyer
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
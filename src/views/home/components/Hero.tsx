import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[430px] md:h-[600px] py-12 md:py-0 bg-[url('/assets/images/hero-background.png')] bg-cover bg-center flex items-center px-5 md:px-[5%] text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-[1]"></div>
      
      <div className="relative z-[2] max-w-[600px]">
        <div className="inline-block bg-[#E5A93C] text-[#1a1a1a] text-[10px] md:text-xs font-bold tracking-wider px-3 py-1 mb-3.5 md:mb-6 uppercase rounded-full md:rounded-sm">
          FRESH FROM FARM, QUALITY TO TABLE
        </div>
        
        <h1 className="text-[26px] sm:text-3xl md:text-6xl font-black leading-[1.18] md:leading-[1.1] m-0 mb-3 md:mb-6 tracking-tight">
          Premium meat &<br />Nigerian spices,<br />delivered fresh
        </h1>
        
        <p className="text-xs sm:text-sm md:text-xl text-gray-200 leading-relaxed m-0 mb-6 md:mb-10 font-normal md:font-light opacity-95 max-w-[340px] md:max-w-[500px]">
          Hygienically processed, vacuum-sealed and cold-chain<br className="hidden sm:block" />
          {" "}delivered — same-day across Owerri & Imo State<span className="hidden md:inline"> and nationwide in 2-5 working days</span>.
        </p>
        
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/products"
            className="bg-[#8B1919] hover:bg-[#6b1010] text-white no-underline py-2.5 px-5 md:py-3 md:px-8 text-xs md:text-base font-bold md:font-semibold cursor-pointer rounded-lg md:rounded transition-colors duration-200 shadow-lg shadow-black/20 whitespace-nowrap inline-flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>SHOP NOW</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/products"
            className="bg-transparent border border-white md:border-2 text-white hover:bg-white hover:text-black no-underline py-2.5 px-5 md:py-3 md:px-8 text-xs md:text-base font-bold md:font-semibold cursor-pointer rounded-lg md:rounded transition-all duration-200 whitespace-nowrap inline-flex items-center justify-center active:scale-95"
          >
            BUY IN BULK
          </Link>
        </div>
      </div>
    </section>
  );
}
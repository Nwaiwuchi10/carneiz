import React from 'react';
import Link from 'next/link';
import { Shield, Check, Truck } from 'lucide-react';

export default function DeliveryMap() {
  return (
    <section className="py-8 md:py-16 px-4 md:px-[5%] bg-white border-t border-gray-100">
      {/* Mobile Delivery Section */}
      <div className="block md:hidden">
        <h2 className="text-base font-bold text-gray-900 m-0">We Deliver Nationwide</h2>
        <p className="text-xs text-gray-500 m-0 mt-1 leading-relaxed">
          Fast cold-chain delivery across Owerri, Imo State and major cities
        </p>

        <div className="flex flex-col gap-2 my-4">
          <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
            <span className="text-[#8B1919] font-bold text-sm">✓</span>
            <span>Owerri Metropolis (Same Day Delivery)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
            <span className="text-[#8B1919] font-bold text-sm">✓</span>
            <span>Across Imo State & Environs (Same Day / 24 Hrs)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
            <span className="text-[#8B1919] font-bold text-sm">✓</span>
            <span>Nationwide & Other States (2-5 Days)</span>
          </div>
        </div>

        {/* Map graphic */}
        <div className="w-full my-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src="/assets/images/MapContainer.png"
            alt="Delivery Map"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Action button */}
        <Link
          href="/contact"
          className="w-full block text-center bg-[#8B1919] hover:bg-[#6b1010] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md border-none cursor-pointer transition-colors no-underline"
        >
          CHECK YOUR AREA
        </Link>

        {/* Mobile Certifications List */}
        <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-[#8B1919]">
              <Shield className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="m-0 text-sm font-bold text-gray-900">NAFDAC Approved</h4>
              <p className="m-0 text-xs text-[#D97706] font-medium mt-0.5">Reg: 03-8849L</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-[#8B1919]">
              <Check className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="m-0 text-sm font-bold text-gray-900">HACCP Certified</h4>
              <p className="m-0 text-xs text-[#D97706] font-medium mt-0.5">Hazard Analyzed & Vetted</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-[#8B1919]">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="m-0 text-sm font-bold text-gray-900">Export Ready</h4>
              <p className="m-0 text-xs text-[#D97706] font-medium mt-0.5">Meets Global Food Standards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Delivery Section */}
      <div className="hidden md:flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
        <div className="flex-[1.2]">
          <h2 className="text-3xl font-bold text-gray-900 m-0 mb-4">We Deliver Nationwide</h2>
          <p className="text-gray-600 text-lg leading-relaxed m-0 mb-8">
            Experience fresh cuts and spices delivered right to your door across Owerri and Imo State.
          </p>
          <ul className="list-none p-0 m-0 mb-10 flex flex-col gap-4">
            <li className="flex items-center gap-3 text-gray-800 font-medium">
              <span className="text-[#8B1919] font-bold">✓</span> Owerri Metropolis (Same Day Delivery)
            </li>
            <li className="flex items-center gap-3 text-gray-800 font-medium">
              <span className="text-[#8B1919] font-bold">✓</span> Across Imo State & Environs (Same Day / 24 Hrs)
            </li>
            <li className="flex items-center gap-3 text-gray-800 font-medium">
              <span className="text-[#8B1919] font-bold">✓</span> Port Harcourt & Abuja (24-48 hrs)
            </li>
            <li className="flex items-center gap-3 text-gray-800 font-medium">
              <span className="text-[#8B1919] font-bold">✓</span> Other States Nationwide (2-5 days)
            </li>
          </ul>
          <Link
            href="/contact"
            className="inline-block bg-[#8B1919] hover:bg-[#6b1010] text-white border-none py-3 px-8 text-base font-semibold cursor-pointer rounded transition-colors duration-200 no-underline shadow-sm"
          >
            CHECK YOUR AREA
          </Link>
        </div>
        <div className="flex-1 w-full relative">
          <div className="relative pt-[70%] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-md">
            <img src="/assets/images/MapContainer.png" alt="Delivery Map" className="absolute top-0 left-0 w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
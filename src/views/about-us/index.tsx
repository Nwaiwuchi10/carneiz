"use client";

import React from 'react';

const PromiseCards = () => {
  const cards = [
    { id: '1', title: 'Freshness', desc: 'We are committed to supplying fresh, carefully selected meat and protein products.' },
    { id: '2', title: 'Quality', desc: 'We maintain high standards in product selection, preparation, packaging and handling.' },
    { id: '3', title: 'Affordability', desc: 'We aim to make quality protein accessible at fair and competitive prices.' },
    { id: '4', title: 'Reliability', desc: 'We work to ensure that orders are prepared accurately and delivered as agreed.' },
    { id: '5', title: 'Customer Care', desc: 'We listen to our customers and continuously improve their experience.' },
    { id: '6', title: 'Trust', desc: 'We conduct our business with honesty, transparency and responsibility.' },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 px-[5%]">
      {cards.map(card => (
        <div key={card.id} className="bg-white p-8 rounded-xl border border-gray-100 flex flex-col shadow-sm">
          <div className="w-9 h-9 bg-[#8B1919] text-white rounded-full flex justify-center items-center font-bold mb-6">
            {card.id}
          </div>
          <h3 className="m-0 mb-4 text-gray-900 text-xl font-bold">{card.title}</h3>
          <p className="m-0 text-gray-600 leading-relaxed text-base">{card.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Our Story / Founding Story */}
      <section className="py-20 px-[5%] flex flex-wrap gap-16 items-center">
        <div className="flex-[1_1_500px]">
          <h1 className="text-4xl text-gray-900 font-bold m-0 mb-8">Our Story / Founding Story</h1>
          <div className="text-gray-600 leading-[1.8] flex flex-col gap-6 text-lg">
            <p className="m-0">Carneiz Ltd was established with a simple idea: quality protein should be fresh, accessible and convenient to buy. Based in Owerri, Imo State, Nigeria, Carneiz was created to make it easier for individuals, families and businesses to access quality meat and protein products without compromising on value or service.</p>
            <p className="m-0">We began with a focus on serving customers in our local market and have continued to develop the business around three key principles: quality products, fair pricing and dependable customer service. As the brand grows, our ambition is to build a trusted Nigerian food and protein company with the capacity to serve customers beyond Nigeria.</p>
            <p className="m-0">Today, Carneiz offers a range of protein products including beef, goat meat, catfish, chicken, turkey and protein powder. We are also developing our export capabilities so that customers in international markets can access selected Nigerian food products through a reliable supply chain.</p>
          </div>
        </div>
        <div className="flex-[1_1_400px]">
          <img src="/assets/images/about-cashier.jpg" alt="Cashier" className="w-full rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]" />
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 font-bold m-0 mb-2">Our Promise</h2>
          <p className="text-gray-500 m-0 text-lg">Our Promise to Every Customer</p>
        </div>
        <PromiseCards />
      </section>

      {/* Our Mission Section */}
      <section className="py-20 px-[5%] flex flex-wrap gap-16 items-center">
        <div className="flex-[1_1_400px]">
          <img src="/assets/images/about-mission.jpg" alt="Carneiz Butchery Processing" className="w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 object-cover h-[380px] md:h-[420px]" />
        </div>
        <div className="flex-[1_1_500px]">
          <h2 className="text-4xl text-gray-900 font-bold m-0 mb-6">Our Mission</h2>
          <p className="text-gray-600 leading-[1.8] text-lg m-0">
            To provide high-quality, fresh and affordable meat and protein products while connecting customers to trusted sources of nutritious food. We are committed to excellent customer service, responsible food handling and reliable delivery, while building a Nigerian food brand that can serve customers locally and internationally.
          </p>
        </div>
      </section>

      {/* Countries Served Section */}
      <section className="py-20 px-[5%] bg-white border-t border-gray-100">
        <h2 className="text-4xl text-gray-900 font-bold m-0 mb-12">Countries Served</h2>
        
        <div className="flex flex-col gap-8 max-w-[900px]">
          <div className="flex gap-4 items-start">
            <span className="text-[#8B1919] font-bold text-xl mt-0.5">✓</span>
            <div>
              <h4 className="m-0 mb-2 text-gray-900 text-lg font-bold">Nigeria</h4>
              <p className="m-0 text-gray-600 text-base leading-relaxed">Our primary domestic market, with operations based in Owerri, Imo State.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-[#8B1919] font-bold text-xl mt-0.5">✓</span>
            <div>
              <h4 className="m-0 mb-2 text-gray-900 text-lg font-bold">United Kingdom</h4>
              <p className="m-0 text-gray-600 text-base leading-relaxed">An international export market for Carneiz, with the company developing its export and international supply capabilities.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-[#8B1919] font-bold text-xl mt-0.5">✓</span>
            <div>
              <h4 className="m-0 mb-2 text-gray-900 text-lg font-bold">Future International markets</h4>
              <p className="m-0 text-gray-600 text-base leading-relaxed">Carneiz intends to expand into additional international markets as export capacity, regulatory requirements and reliable distribution arrangements are established.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

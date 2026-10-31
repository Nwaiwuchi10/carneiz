import React from 'react';
import Link from 'next/link';
import ContactInfo, { SocialLinks } from '@/src/components/ContactInfo';
import { CARNEIZ_CONTACT } from '@/src/constants/contactInfo';
import NewsletterSubscription from '@/src/components/NewsletterSubscription';

const culinaryFeed = [
  '/assets/images/401a6bf8c3a93022bf5363db9ee84b979f6a5a9b.jpg',
  '/assets/images/1e3059d8f070acc782d4d51f780e4d2d28842b10.jpg',
  '/assets/images/5cf9a98aea0bc57fc4b1dd6e4ff60f71cce4a11e.jpg',
  '/assets/images/acb23e5f1de495381b219ce59abb90409a30db3a.jpg',
  '/assets/images/c78499c3a52702725befc63a3e8d288fb01c9cbe.jpg',
  '/assets/images/5624854e351e152b9ce6cb548fca881d6f671cf0.jpg'
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Social / Culinary Inspiration Section */}
      <div className="py-8 md:py-12 px-4 md:px-[5%] border-b border-gray-100">
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-base md:text-2xl font-bold text-gray-900 m-0 mb-1">Follow Us @Carneiz</h3>
          <p className="text-gray-400 text-xs md:text-sm m-0 mb-3">Join our vibrant cooking community on social media</p>
          <div className="flex justify-center">
            <SocialLinks variant="pills" />
          </div>
        </div>

        {/* Mobile Vertical Feed */}
        <div className="flex flex-col gap-3.5 md:hidden">
          {culinaryFeed.map((img, i) => (
            <a
              key={i}
              href={CARNEIZ_CONTACT.socials.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-2xl overflow-hidden shadow-xs bg-gray-50 border border-gray-100 block transition-transform active:scale-[0.99]"
            >
              <img
                src={img}
                alt={`Carneiz culinary recipe ${i + 1}`}
                className="w-full h-auto object-cover block"
                loading="lazy"
              />
            </a>
          ))}
        </div>

        {/* Desktop 6-Column Grid */}
        <div className="hidden md:grid grid-cols-6 gap-2">
          {culinaryFeed.map((img, i) => (
            <a
              key={i}
              href={CARNEIZ_CONTACT.socials.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-[100%] bg-gray-100 bg-cover bg-center rounded cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-sm"
              style={{ backgroundImage: `url(${img})` }}
              title="View on Instagram @carneiz_meat_spices"
            />
          ))}
        </div>
      </div>

      {/* Newsletter Section (Desktop & Mobile) */}
      <NewsletterSubscription />

      {/* Mobile Footer */}
      <div className="block md:hidden px-5 py-8 bg-[#fdfdfd]">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-xs border border-gray-100 bg-[#261815] shrink-0">
            <img
              src={CARNEIZ_CONTACT.logoUrl}
              alt={CARNEIZ_CONTACT.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 text-base tracking-tight leading-tight">{CARNEIZ_CONTACT.name}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mt-0.5">Meat & Spices</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed m-0 mb-4 max-w-[320px]">
          {CARNEIZ_CONTACT.shortDescription}
        </p>

        {/* Mobile Social Links */}
        <div className="mb-6">
          <SocialLinks size="md" />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="m-0 text-sm font-bold text-gray-900 mb-3">Quick Links</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-xs text-gray-500 font-medium">
              <li><Link href="/products" className="hover:text-[#8B1919] no-underline text-inherit">Shop</Link></li>
              <li><Link href="/about-us" className="hover:text-[#8B1919] no-underline text-inherit">About Us</Link></li>
              <li><Link href="/products?category=Spices" className="hover:text-[#8B1919] no-underline text-inherit">Spices</Link></li>
              <li><Link href="/#faq" className="hover:text-[#8B1919] no-underline text-inherit">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-[#8B1919] no-underline text-inherit">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="m-0 text-sm font-bold text-gray-900 mb-3">Customer Service</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 text-xs text-gray-500 font-medium">
              <li><Link href="/track-order" className="hover:text-[#8B1919] no-underline text-inherit">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-[#8B1919] no-underline text-inherit">Help & Support</Link></li>
              <li><a href={CARNEIZ_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#8B1919] no-underline text-inherit">WhatsApp Chat</a></li>
            </ul>
          </div>
        </div>

        {/* Reusable Contact Info in Mobile Footer */}
        <div className="pt-2 mb-8">
          <h4 className="m-0 text-sm font-bold text-gray-900 mb-3">Contact Info</h4>
          <ContactInfo
            variant="list"
            showWebsite={true}
            showWhatsApp={true}
            showPhone={true}
            showEmail={true}
            showAddress={true}
            className="text-xs"
            itemClassName="text-xs font-medium"
            iconClassName="w-4 h-4 text-amber-600"
          />
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-center items-center text-center">
          <p className="text-[11px] text-gray-400 m-0 text-center">
            © {new Date().getFullYear()} Carneiz Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Desktop Main Footer */}
      <div className="hidden md:block pt-16 pb-6 px-4 md:px-[5%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Socials Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-3.5 no-underline group">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-gray-100 bg-[#261815] shrink-0 transition-transform duration-200 group-hover:scale-105">
                <img
                  src={CARNEIZ_CONTACT.logoUrl}
                  alt={CARNEIZ_CONTACT.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-gray-900 text-xl tracking-tight leading-tight group-hover:text-[#8B1919] transition-colors">
                  Carneiz<span className="text-[#8B1919]"> Ltd</span>
                </span>
                <span className="text-xs font-bold text-[#8B1919] uppercase tracking-wider leading-none mt-1">
                  Meat & Spices
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed m-0 pr-4">
              Your trusted partner for premium quality cuts and authentic Nigerian spices. Delivered fresh to your doorstep.
            </p>
            <div className="mt-2">
              <SocialLinks size="md" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold mb-5 text-base">Quick Links</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li><Link href="/products" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Shop</Link></li>
              <li><Link href="/about-us" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">About Us</Link></li>
              <li><Link href="/products?category=Fresh%20Meat" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Fresh Meat</Link></li>
              <li><Link href="/products?category=Spices" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Local Spices</Link></li>
              <li><Link href="/#faq" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-bold mb-5 text-base">Customer Service</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li><Link href="/track-order" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Track Order</Link></li>
              <li><Link href="/contact" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Customer Support</Link></li>
              <li><a href={CARNEIZ_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 no-underline text-sm transition-colors duration-200 hover:text-[#8B1919]">Instant WhatsApp Chat</a></li>
            </ul>
          </div>

          {/* Reusable Contact Info Component in Desktop Footer */}
          <div>
            <h4 className="text-gray-900 font-bold mb-5 text-base">Contact Us</h4>
            <ContactInfo
              variant="list"
              showWebsite={true}
              showWhatsApp={true}
              showPhone={true}
              showEmail={true}
              showAddress={true}
              iconClassName="w-4 h-4 text-[#8B1919]"
              itemClassName="text-sm"
            />
          </div>
        </div>

        {/* Desktop Bottom Bar */}
        <div className="flex justify-center items-center text-center pt-6 border-t border-gray-100 text-sm text-gray-500">
          <p className="m-0 text-center">© {new Date().getFullYear()} Carneiz Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
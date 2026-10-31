"use client";

import React, { useState } from 'react';
import { CARNEIZ_CONTACT } from '@/src/constants/contactInfo';
import { SocialLinks } from '@/src/components/ContactInfo';
import { MessageCircle, Mail, MapPin, CheckCircle2, Phone } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = CARNEIZ_CONTACT.phone.replace(/[^0-9]/g, '');

    const textLines = [
      `*New Customer Inquiry - Carneiz*`,
      `--------------------------------`,
      `👤 *Name:* ${formData.name.trim()}`,
      `📧 *Email:* ${formData.email.trim()}`,
    ];

    if (formData.phone.trim()) {
      textLines.push(`📞 *Phone:* ${formData.phone.trim()}`);
    }

    if (formData.orderNumber.trim()) {
      textLines.push(`📦 *Order Number:* ${formData.orderNumber.trim()}`);
    }

    textLines.push(
      `--------------------------------`,
      `📝 *Message:*`,
      formData.message.trim(),
      `--------------------------------`,
      `_Sent via Carneiz Website Contact Form_`
    );

    const fullText = textLines.join('\n');
    const encodedText = encodeURIComponent(fullText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    setLastWhatsAppUrl(whatsappUrl);
    setSubmitted(true);

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      orderNumber: '',
      message: '',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[320px] md:h-[360px] bg-[url('/assets/images/about-cashier.jpg')] bg-cover bg-center flex flex-col justify-center items-center text-center px-6">
        <div className="absolute inset-0 bg-black/65"></div>
        <div className="relative z-10 max-w-[800px]">
          <h1 className="text-white text-3xl md:text-5xl font-bold m-0 mb-3 drop-shadow-md">
            Get In Touch
          </h1>
          <p className="text-white/90 text-sm md:text-lg m-0 drop-shadow-sm font-medium max-w-xl mx-auto leading-relaxed">
            We're here to assist with your fresh meat orders, spice blends, and nationwide or UK delivery inquiries.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 px-4 md:px-[5%] flex flex-wrap gap-10 max-w-[1200px] mx-auto -mt-14 relative z-20">
        {/* Contact Form */}
        <div className="flex-[1_1_500px] bg-white p-6 sm:p-8 md:p-10 rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="m-0 text-gray-900 text-2xl font-bold">Send Us a Message</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              WhatsApp Support
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Fill out the form below. Your message will be formatted and directly submitted to our official WhatsApp support line (<strong>{CARNEIZ_CONTACT.formattedPhone}</strong>).
          </p>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <div className="w-14 h-14 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Forwarded to WhatsApp!</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name || 'valued customer'}</strong>! Your inquiry has been sent to Carneiz customer care at <strong>{CARNEIZ_CONTACT.formattedPhone}</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {lastWhatsAppUrl && (
                  <a
                    href={lastWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl no-underline shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-gray-900 font-bold text-sm">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chinelo Okonkwo"
                  className="w-full p-3.5 border border-gray-200 rounded-xl outline-none transition-colors duration-200 focus:border-[#8B1919] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-gray-900 font-bold text-sm">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full p-3.5 border border-gray-200 rounded-xl outline-none transition-colors duration-200 focus:border-[#8B1919] text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-gray-900 font-bold text-sm">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0801 234 5678"
                    className="w-full p-3.5 border border-gray-200 rounded-xl outline-none transition-colors duration-200 focus:border-[#8B1919] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-gray-900 font-bold text-sm">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  placeholder="e.g. #CRNZ-28491"
                  className="w-full p-3.5 border border-gray-200 rounded-xl outline-none transition-colors duration-200 focus:border-[#8B1919] text-sm"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-gray-900 font-bold text-sm">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry, order question, or bulk meat request..."
                  className="w-full p-3.5 border border-gray-200 rounded-xl outline-none h-[130px] resize-y transition-colors duration-200 focus:border-[#8B1919] text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full p-4 bg-[#25D366] hover:bg-[#20bd5a] text-white border-none rounded-xl font-bold cursor-pointer mt-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 text-base active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>SUBMIT VIA WHATSAPP</span>
              </button>

              <p className="text-center text-xs text-gray-400 m-0 mt-1">
                Submitting will directly launch WhatsApp with your pre-filled inquiry to <strong>{CARNEIZ_CONTACT.formattedPhone}</strong>.
              </p>
            </form>
          )}
        </div>

        {/* Direct Support Sidebar */}
        <div className="flex-[1_1_350px] flex flex-col gap-6 pt-0 md:pt-4">
          <h2 className="m-0 text-gray-900 text-2xl font-bold">Direct Channels</h2>

          <div className="flex flex-col gap-4">
            {/* WhatsApp Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 flex gap-5 items-start shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#25D366] flex justify-center items-center text-xl shrink-0">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold tracking-wider mb-1 uppercase">
                  Instant WhatsApp Chat
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {CARNEIZ_CONTACT.formattedPhone}
                </div>
                <div className="text-xs text-gray-500 mb-2.5">
                  Available for rapid customer care & bulk orders
                </div>
                <a
                  href={CARNEIZ_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:text-[#20bd5a] font-bold no-underline text-xs inline-flex items-center gap-1"
                >
                  Chat on WhatsApp &rarr;
                </a>
              </div>
            </div>

            {/* Phone Call Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 flex gap-5 items-start shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B1919] flex justify-center items-center text-xl shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold tracking-wider mb-1 uppercase">
                  Telephone Support
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {CARNEIZ_CONTACT.formattedPhone}
                </div>
                <div className="text-xs text-gray-500 mb-2.5">
                  Direct hotline for urgent butchery and delivery questions
                </div>
                <a
                  href={`tel:${CARNEIZ_CONTACT.phone}`}
                  className="text-[#8B1919] font-bold no-underline text-xs hover:underline inline-flex items-center gap-1"
                >
                  Call Now &rarr;
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 flex gap-5 items-start shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex justify-center items-center text-xl shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold tracking-wider mb-1 uppercase">
                  Email Support
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {CARNEIZ_CONTACT.email}
                </div>
                <div className="text-xs text-gray-500 mb-2.5">
                  Corporate catering & partnerships
                </div>
                <a
                  href={`mailto:${CARNEIZ_CONTACT.email}`}
                  className="text-[#8B1919] font-bold no-underline text-xs hover:underline inline-flex items-center gap-1"
                >
                  Send Email &rarr;
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-sm flex gap-5 items-start">
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-600 flex justify-center items-center text-xl shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold tracking-wider mb-1 uppercase">
                  Office & Store Location
                </div>
                <p className="m-0 text-gray-900 font-bold text-sm leading-relaxed mb-1">
                  {CARNEIZ_CONTACT.address}
                </p>
                <div className="text-xs text-gray-500">Nigeria</div>
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[11px] text-gray-400 font-bold tracking-wider mb-3 uppercase">
                Connect on Social Media
              </div>
              <SocialLinks variant="pills" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

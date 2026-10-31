"use client";

import React from "react";
import { CARNEIZ_CONTACT } from "@/src/constants/contactInfo";

export default function FloatingWhatsApp() {
  return (
    <a
      href={CARNEIZ_CONTACT.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 drop-shadow-xl group"
      aria-label="Chat on WhatsApp"
      title="Chat with Carneiz on WhatsApp"
    >
      <img
        src="/assets/images/whatsapp.png"
        alt="Chat on WhatsApp"
        className="w-full h-full object-contain transition-transform duration-300 group-hover:rotate-6"
        width={64}
        height={64}
      />
    </a>
  );
}

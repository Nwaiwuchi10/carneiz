"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, MessageCircle } from "lucide-react";
import { CARNEIZ_CONTACT } from "@/src/constants/contactInfo";

// Brand Social Icons
export function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.3 0 .58.05.85.13V9.4a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.67 6.33 6.33 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.33v-7.14a8.16 8.16 0 0 0 4.92 1.63V6.69z" />
    </svg>
  );
}

export interface SocialLinksProps {
  className?: string;
  variant?: "circles" | "minimal" | "pills";
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function SocialLinks({
  className = "",
  variant = "circles",
  size = "md",
  showLabels = false,
}: SocialLinksProps) {
  const { facebook, instagram, tiktok } = CARNEIZ_CONTACT.socials;

  const sizeStyles = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const items = [
    {
      key: "facebook",
      data: facebook,
      icon: <FacebookIcon className={iconSizes[size]} />,
      hoverColor: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      key: "instagram",
      data: instagram,
      icon: <InstagramIcon className={iconSizes[size]} />,
      hoverColor: "hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]",
    },
    {
      key: "tiktok",
      data: tiktok,
      icon: <TikTokIcon className={iconSizes[size]} />,
      hoverColor: "hover:bg-black hover:text-white hover:border-black",
    },
  ];

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap gap-2.5 ${className}`}>
        {items.map(({ key, data, icon, hoverColor }) => (
          <a
            key={key}
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={data.ariaLabel}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 transition-all duration-200 ${hoverColor} no-underline`}
          >
            {icon}
            <span>{data.name}</span>
          </a>
        ))}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {items.map(({ key, data, icon }) => (
          <a
            key={key}
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={data.ariaLabel}
            className="text-gray-500 hover:text-[#8B1919] transition-colors duration-200"
          >
            {icon}
          </a>
        ))}
      </div>
    );
  }

  // Default "circles"
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {items.map(({ key, data, icon, hoverColor }) => (
        <a
          key={key}
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={data.ariaLabel}
          title={data.name}
          className={`${sizeStyles[size]} rounded-full bg-gray-100 text-gray-600 border border-transparent flex items-center justify-center transition-all duration-200 ${hoverColor} no-underline shadow-xs hover:scale-105 active:scale-95`}
        >
          {icon}
          {showLabels && <span className="sr-only">{data.name}</span>}
        </a>
      ))}
    </div>
  );
}

export interface ContactInfoProps {
  variant?: "list" | "cards" | "inline";
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showWhatsApp?: boolean;
  showSocials?: boolean;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  iconContainerClassName?: string;
  colorTheme?: "light" | "muted" | "dark";
}

export default function ContactInfo({
  variant = "list",
  showAddress = true,
  showPhone = true,
  showEmail = true,
  showWebsite = false,
  showWhatsApp = false,
  showSocials = false,
  className = "",
  itemClassName = "",
  iconClassName = "",
  labelClassName = "",
  iconContainerClassName = "",
  colorTheme = "muted",
}: ContactInfoProps) {
  const contact = CARNEIZ_CONTACT;

  const textColors = {
    muted: "text-gray-600 hover:text-[#8B1919]",
    light: "text-white/90 hover:text-white",
    dark: "text-gray-900 hover:text-[#8B1919]",
  };

  const defaultIconColor =
    colorTheme === "light"
      ? "text-red-400"
      : colorTheme === "dark"
      ? "text-[#8B1919]"
      : "text-amber-600";

  if (variant === "cards") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {showPhone && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B1919] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Direct Line / Support
              </span>
              <a
                href={`tel:${contact.phone}`}
                className="text-gray-900 font-bold text-lg hover:text-[#8B1919] no-underline block"
              >
                {contact.formattedPhone}
              </a>
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

        {showEmail && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B1919] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Email Inquiries
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="text-gray-900 font-bold text-lg hover:text-[#8B1919] no-underline block"
              >
                {contact.email}
              </a>
              <span className="text-xs text-gray-500 block mt-1">
                Typical reply within 2 hours
              </span>
            </div>
          </div>
        )}

        {showAddress && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#8B1919] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Headquarters
              </span>
              <p className="text-gray-800 font-semibold text-sm leading-relaxed m-0">
                {contact.address}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-6 text-sm ${className}`}>
        {showPhone && (
          <a
            href={`tel:${contact.phone}`}
            className={`inline-flex items-center gap-2 no-underline transition-colors ${textColors[colorTheme]} ${itemClassName}`}
          >
            <Phone className={`w-4 h-4 ${iconClassName || defaultIconColor}`} />
            <span>{contact.formattedPhone}</span>
          </a>
        )}
        {showEmail && (
          <a
            href={`mailto:${contact.email}`}
            className={`inline-flex items-center gap-2 no-underline transition-colors ${textColors[colorTheme]} ${itemClassName}`}
          >
            <Mail className={`w-4 h-4 ${iconClassName || defaultIconColor}`} />
            <span>{contact.email}</span>
          </a>
        )}
        {showAddress && (
          <div
            className={`inline-flex items-center gap-2 ${textColors[colorTheme]} ${itemClassName}`}
          >
            <MapPin className={`w-4 h-4 ${iconClassName || defaultIconColor}`} />
            <span>{contact.address}</span>
          </div>
        )}
      </div>
    );
  }

  // Default "list"
  return (
    <ul className={`list-none p-0 m-0 flex flex-col gap-3 text-sm ${className}`}>
      {showWebsite && (
        <li className={`flex items-center gap-2.5 ${itemClassName}`}>
          <div className={iconContainerClassName}>
            <Globe className={`w-4 h-4 shrink-0 ${iconClassName || defaultIconColor}`} />
          </div>
          <a
            href={contact.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`no-underline transition-colors ${textColors[colorTheme]} ${labelClassName}`}
          >
            {contact.websiteDisplay}
          </a>
        </li>
      )}

      {showPhone && (
        <li className={`flex items-center gap-2.5 ${itemClassName}`}>
          <div className={iconContainerClassName}>
            <Phone className={`w-4 h-4 shrink-0 ${iconClassName || defaultIconColor}`} />
          </div>
          <a
            href={`tel:${contact.phone}`}
            className={`no-underline transition-colors ${textColors[colorTheme]} ${labelClassName}`}
          >
            {contact.formattedPhone}
          </a>
        </li>
      )}

      {showWhatsApp && (
        <li className={`flex items-center gap-2.5 ${itemClassName}`}>
          <div className={iconContainerClassName}>
            <MessageCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          </div>
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`no-underline transition-colors ${textColors[colorTheme]} ${labelClassName}`}
          >
            WhatsApp Support
          </a>
        </li>
      )}

      {showEmail && (
        <li className={`flex items-center gap-2.5 ${itemClassName}`}>
          <div className={iconContainerClassName}>
            <Mail className={`w-4 h-4 shrink-0 ${iconClassName || defaultIconColor}`} />
          </div>
          <a
            href={`mailto:${contact.email}`}
            className={`no-underline transition-colors ${textColors[colorTheme]} ${labelClassName}`}
          >
            {contact.email}
          </a>
        </li>
      )}

      {showAddress && (
        <li className={`flex items-start gap-2.5 leading-relaxed ${itemClassName}`}>
          <div className={`mt-0.5 ${iconContainerClassName}`}>
            <MapPin className={`w-4 h-4 shrink-0 ${iconClassName || defaultIconColor}`} />
          </div>
          <span className={`${textColors[colorTheme]} ${labelClassName}`}>
            {contact.address}
          </span>
        </li>
      )}

      {showSocials && (
        <li className="pt-2">
          <SocialLinks />
        </li>
      )}
    </ul>
  );
}

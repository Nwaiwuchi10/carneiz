import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carneiz Ltd | Premium Butchery & Hand-Blended Spices",
  description: "Fresh farm-sourced premium meat cuts and authentic handcrafted Nigerian spices delivered directly to your doorstep in Owerri, Imo State and nationwide.",
  icons: {
    icon: [
      { url: '/assets/images/logo-circle.png', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/assets/images/logo-circle.png',
    apple: '/assets/images/logo-circle.png',
  },
};

import Navbar from '@/src/views/home/components/Navbar';
import Footer from '@/src/views/home/components/Footer';
import Providers from '@/src/context/Providers';
import ClientLayoutWrapper from '@/src/components/ClientLayoutWrapper';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ClientLayoutWrapper navbar={<Navbar />} footer={<Footer />}>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

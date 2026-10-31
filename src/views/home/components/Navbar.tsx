"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  User,
  ShoppingCart,
  LogOut,
  Bell,
  ShoppingBag,
  MapPin,
  CreditCard,
  Star,
  Heart,
} from 'lucide-react';
import { useCart } from '@/src/context/CartContext';
import { useAppDispatch } from '@/src/redux/hooks';
import { toggleCart } from '@/src/redux/slices/cartSlice';
import { CARNEIZ_CONTACT } from '@/src/constants/contactInfo';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopAccountOpen, setDesktopAccountOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const desktopAccountRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);

  const { cart } = useCart();
  const cartItemCount = cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchNotifCount = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      let userEmail = '';
      try {
        const stored = localStorage.getItem('carneiz_user') || localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          userEmail = parsed.email || '';
          setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }

      if (!userEmail) {
        setUnreadNotifs(0);
        return;
      }

      const url = `${apiUrl}/notifications/user?email=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.unreadCount !== undefined) {
        setUnreadNotifs(data.unreadCount);
      }
    } catch {
      setUnreadNotifs(0);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carneiz_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUnreadNotifs(0);
    setDesktopAccountOpen(false);
    setMobileAccountOpen(false);
    window.dispatchEvent(new Event('carneiz_user_changed'));
  };

  useEffect(() => {
    fetchNotifCount();
    const handleUserChanged = () => fetchNotifCount();
    window.addEventListener('carneiz_user_changed', handleUserChanged);
    window.addEventListener('storage', handleUserChanged);

    const interval = setInterval(fetchNotifCount, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('carneiz_user_changed', handleUserChanged);
      window.removeEventListener('storage', handleUserChanged);
    };
  }, [fetchNotifCount]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopAccountRef.current && !desktopAccountRef.current.contains(e.target as Node)) {
        setDesktopAccountOpen(false);
      }
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(e.target as Node)) {
        setMobileAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route navigation
  useEffect(() => {
    setDesktopAccountOpen(false);
    setMobileAccountOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const getLinkClass = (path: string) => {
    const base = "text-gray-700 font-medium text-sm transition-colors duration-200 hover:text-[#8B1919]";
    return pathname === path ? `${base} text-[#8B1919]` : base;
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    { label: 'Fresh Meat', href: '/products?category=Fresh%20Meat' },
    { label: 'Spices', href: '/products?category=Spices' },
    { label: 'Recipes', href: '#' },
    { label: 'Wholesale', href: '#' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact', href: '/contact' },
    { label: 'Track Order', href: '/track-order' },
  ];

  const accountMenuItems = [
    { label: 'Order History', href: '/account/orders', icon: ShoppingBag },
    { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { label: 'Payment Methods', href: '/account/payment', icon: CreditCard },
    { label: 'Reviews', href: '/account/reviews', icon: Star },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, badge: unreadNotifs },
  ];

  return (
    <>
      {/* Mobile Top Announcement Bar */}
      <div className="md:hidden bg-[#1c1c1c] text-white text-[10px] sm:text-[11px] font-semibold py-2.5 px-4 text-center tracking-wider uppercase">
        FREE DELIVERY ON ORDERS ABOVE ₦75,000
      </div>

      {/* Mobile Navbar Header */}
      <nav className="flex md:hidden justify-between items-center px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="bg-transparent border-none cursor-pointer p-1 text-gray-900 flex items-center justify-center focus:outline-none"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs border border-gray-100 bg-[#261815] shrink-0">
            <img src={CARNEIZ_CONTACT.logoUrl} alt="Carneiz Ltd" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight">Carneiz Ltd</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Meat & Spices</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/products" className="bg-transparent border-none cursor-pointer text-gray-800 p-0 flex items-center justify-center hover:text-[#8B1919] transition-colors no-underline">
            <Search className="w-5 h-5 stroke-[2]" />
          </Link>
          <Link href="/account/notifications" className="bg-transparent border-none cursor-pointer text-gray-800 p-0 flex items-center justify-center hover:text-[#8B1919] transition-colors no-underline relative" aria-label="Notifications">
            <Bell className="w-5 h-5 stroke-[2]" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#8B1919] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </Link>

          {/* Mobile Profile Icon with Dropdown */}
          <div className="relative" ref={mobileAccountRef}>
            <button
              type="button"
              onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
              className="bg-transparent border-none cursor-pointer text-gray-800 p-0 flex items-center justify-center hover:text-[#8B1919] transition-colors"
              aria-label="Account Profile Menu"
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {mobileAccountOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-3xl border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.18)] p-4 z-50">
                {currentUser ? (
                  <div className="px-3.5 pt-1 pb-3 border-b border-gray-100 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">
                        MY ACCOUNT
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate block mt-0.5">
                      {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.email}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate block">
                      {currentUser.email}
                    </span>
                  </div>
                ) : (
                  <div className="px-3.5 pt-1 pb-3 border-b border-gray-100 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">
                      MY ACCOUNT
                    </span>
                    <Link
                      href="/login"
                      onClick={() => setMobileAccountOpen(false)}
                      className="text-xs text-[#8B1919] font-bold no-underline hover:underline"
                    >
                      Log In
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isHighlighted = isActive || (pathname === '/' && item.label === 'Notifications');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileAccountOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl no-underline text-xs sm:text-sm font-semibold transition-all ${
                          isHighlighted
                            ? 'bg-[#FDF4F4] text-[#8B1919] font-bold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 stroke-[2] ${
                              isHighlighted ? 'text-[#8B1919]' : 'text-gray-600'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="bg-[#8B1919] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
                {currentUser && (
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl border-none bg-transparent hover:bg-red-50 text-red-600 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 stroke-[2]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => dispatch(toggleCart())} 
            className="bg-transparent border-none cursor-pointer text-gray-800 p-0 flex items-center justify-center hover:text-[#8B1919] transition-colors relative"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#8B1919] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden bg-white flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-[#261815] shrink-0">
                  <img src={CARNEIZ_CONTACT.logoUrl} alt="Carneiz Ltd" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="m-0 font-bold text-gray-900 text-base leading-tight">Carneiz Ltd</h3>
                  <p className="m-0 text-xs text-gray-400 font-medium">Meat & Spices • Premium Butchery</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full border border-[#8B1919] text-[#8B1919] flex items-center justify-center bg-transparent cursor-pointer hover:bg-red-50 transition-colors p-0"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-4 pt-6">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-900 hover:text-[#8B1919] font-medium text-base no-underline transition-colors block"
                >
                  {link.label}
                </Link>
              ))}

              {/* My Account Links inside Drawer */}
              <div className="pt-4 border-t border-gray-100 mt-2">
                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2">My Account</h4>
                <div className="flex flex-col gap-1.5">
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-gray-700 hover:text-[#8B1919] text-sm font-semibold py-1.5 no-underline"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>

          {/* Drawer Bottom */}
          <div className="pt-6 border-t border-gray-100 mt-8">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-gray-800 hover:text-[#8B1919] font-medium text-base bg-transparent border-none cursor-pointer p-0 transition-colors"
            >
              <LogOut className="w-5 h-5 rotate-180" />
              <span>Logout</span>
            </button>
            <p className="text-xs text-gray-400 mt-4 mb-0">
              © {new Date().getFullYear()} Carneiz Ltd. All Rights Reserved.
            </p>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <nav className="hidden md:flex justify-between items-center px-4 md:px-[5%] py-3.5 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-3.5 no-underline group py-0.5">
          <div className="w-13 h-13 md:w-14 md:h-14 rounded-full overflow-hidden shadow-sm border-2 border-gray-100/90 bg-[#261815] shrink-0 transition-transform duration-200 group-hover:scale-105">
            <img src={CARNEIZ_CONTACT.logoUrl} alt="Carneiz Ltd" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-gray-900 text-xl tracking-tight leading-none group-hover:text-[#8B1919] transition-colors">
              Carneiz<span className="text-[#8B1919]"> Ltd</span>
            </span>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-tight mt-1">
              Meat & Spices
            </span>
          </div>
        </Link>

        <ul className="hidden lg:flex list-none gap-8 m-0 p-0">
          <li><Link href="/" className={getLinkClass('/')}>Home</Link></li>
          <li><Link href="/products" className={getLinkClass('/products')}>Shop</Link></li>
          <li><Link href="/about-us" className={getLinkClass('/about-us')}>About Us</Link></li>
          <li><Link href="/contact" className={getLinkClass('/contact')}>Contact</Link></li>
          <li><Link href="/track-order" className={getLinkClass('/track-order')}>Track Order</Link></li>
        </ul>

        <div className="flex items-center gap-6">
          <Link href="/products" className="bg-transparent border-none cursor-pointer text-gray-800 flex items-center justify-center p-0 transition-colors duration-200 hover:text-[#8B1919] no-underline" aria-label="Search Catalog">
            <Search className="w-5 h-5 stroke-[2]" />
          </Link>

          <Link href="/account/notifications" className="bg-transparent border-none cursor-pointer text-gray-800 flex items-center justify-center p-0 transition-colors duration-200 hover:text-[#8B1919] no-underline relative" aria-label="Notifications">
            <Bell className="w-5 h-5 stroke-[2]" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#8B1919] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </Link>

          {/* Desktop Profile Icon with Dropdown & Hover */}
          <div
            className="relative"
            ref={desktopAccountRef}
            onMouseEnter={() => setDesktopAccountOpen(true)}
            onMouseLeave={() => setDesktopAccountOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDesktopAccountOpen(!desktopAccountOpen)}
              className="bg-transparent border-none cursor-pointer text-gray-800 flex items-center justify-center p-0 transition-colors duration-200 hover:text-[#8B1919] focus:outline-none"
              aria-label="My Account"
              aria-expanded={desktopAccountOpen}
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dropdown Menu matching user mockup */}
            <div
              className={`absolute right-0 top-full pt-3 z-50 transition-all duration-200 ${
                desktopAccountOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-64 bg-white rounded-3xl border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.12)] p-4">
                {currentUser ? (
                  <div className="px-3.5 pt-1 pb-3 border-b border-gray-100 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">
                        MY ACCOUNT
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate block mt-0.5">
                      {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.email}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate block">
                      {currentUser.email}
                    </span>
                  </div>
                ) : (
                  <div className="px-3.5 pt-1 pb-3 border-b border-gray-100 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase text-gray-400">
                      MY ACCOUNT
                    </span>
                    <Link
                      href="/login"
                      onClick={() => setDesktopAccountOpen(false)}
                      className="text-xs text-[#8B1919] font-bold no-underline hover:underline"
                    >
                      Log In
                    </Link>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isHighlighted = isActive || (pathname === '/' && item.label === 'Notifications');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDesktopAccountOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl no-underline text-sm font-semibold transition-colors ${
                          isHighlighted
                            ? 'bg-[#FDF4F4] text-[#8B1919] font-bold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon
                            className={`w-4 h-4 stroke-[2.2] shrink-0 ${
                              isHighlighted ? 'text-[#8B1919]' : 'text-gray-500'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                          <span className="bg-[#8B1919] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
                {currentUser && (
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl border-none bg-transparent hover:bg-red-50 text-red-600 font-semibold text-xs cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4 stroke-[2]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => dispatch(toggleCart())} 
            className="bg-transparent border-none cursor-pointer text-gray-800 flex items-center justify-center p-0 transition-colors duration-200 hover:text-[#8B1919] relative"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#8B1919] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          {currentUser ? (
            <Link
              href="/account/orders"
              className="bg-[#8B1919] hover:bg-[#6b1010] text-white border-none py-2 px-5 rounded font-semibold cursor-pointer no-underline text-xs tracking-wide transition-colors duration-200"
            >
              {currentUser.firstName ? `HI, ${currentUser.firstName.toUpperCase()}` : 'MY ACCOUNT'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-[#8B1919] hover:bg-[#6b1010] text-white border-none py-2 px-7 rounded font-semibold cursor-pointer no-underline text-sm tracking-wide transition-colors duration-200"
            >
              LOG IN
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

"use client";
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, CreditCard, Star, Heart, Bell } from 'lucide-react';

export default function AccountLayout({ children, activeTab }: { children: React.ReactNode, activeTab: string }) {
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
        let userEmail = '';
        try {
          const storedUser = localStorage.getItem('carneiz_user') || localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            userEmail = parsed.email || '';
          }
        } catch {}

        if (!userEmail) {
          setUnreadCount(0);
          return;
        }

        const url = `${apiUrl}/notifications/user?email=${encodeURIComponent(userEmail)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        setUnreadCount(0);
      }
    };

    fetchCount();
    const handleUserChanged = () => fetchCount();
    window.addEventListener('carneiz_user_changed', handleUserChanged);
    window.addEventListener('storage', handleUserChanged);

    return () => {
      window.removeEventListener('carneiz_user_changed', handleUserChanged);
      window.removeEventListener('storage', handleUserChanged);
    };
  }, [activeTab]);

  const tabs = [
    { id: 'orders', label: 'Order History', icon: ShoppingBag, link: '/account/orders' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, link: '/account/addresses' },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard, link: '/account/payment' },
    { id: 'reviews', label: 'Reviews', icon: Star, link: '/account/reviews' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, link: '/account/wishlist' },
    { id: 'notifications', label: 'Notifications', icon: Bell, link: '/account/notifications', badge: unreadCount }
  ];

  return (
    <div className="bg-white min-h-screen py-8 md:py-10 px-4 md:px-[6%]">
      {/* Breadcrumb matching Image 1 */}
      <div className="mb-4 text-xs font-semibold text-gray-400">
        Home &nbsp;/&nbsp; <span className="text-[#8B1919]">{tabs.find(t => t.id === activeTab)?.label}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content */}
        <div className="flex-1 w-full order-2 lg:order-1 min-w-0">
          <h1 className="m-0 mb-6 text-gray-900 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          {children}
        </div>

        {/* Sidebar matching Image 1 */}
        <div className="w-full lg:w-72 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm order-1 lg:order-2 shrink-0 lg:sticky lg:top-24">
          <h3 className="m-0 px-3 mb-4 text-gray-900 text-xs font-extrabold tracking-wider uppercase">
            MY ACCOUNT
          </h3>
          <ul className="list-none p-0 m-0 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <Link 
                    href={tab.link} 
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl no-underline text-xs sm:text-sm transition-all ${
                      isActive 
                        ? 'text-[#8B1919] bg-[#fdf2f2] font-bold' 
                        : 'text-gray-600 bg-transparent font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B1919]' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && tab.badge > 0 ? (
                      <span className="bg-[#8B1919] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
      </div>
    </div>
  );
}

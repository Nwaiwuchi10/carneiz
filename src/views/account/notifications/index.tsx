"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AccountLayout from '@/src/components/Account/AccountLayout';
import axios from 'axios';
import {
  Loader2,
  Bell,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Truck,
  CreditCard,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NotificationItem {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type?: string;
  createdAt?: string | Date;
  read: boolean;
  metadata?: any;
}

interface StoredUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case 'order':
      return <ShoppingBag className="w-4 h-4 text-amber-600" />;
    case 'delivery':
      return <Truck className="w-4 h-4 text-emerald-600" />;
    case 'payment':
      return <CreditCard className="w-4 h-4 text-blue-600" />;
    case 'auth':
      return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    case 'account':
      return <UserCheck className="w-4 h-4 text-[#8B1919]" />;
    default:
      return <Bell className="w-4 h-4 text-[#8B1919]" />;
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const getStoredUser = (): StoredUser | null => {
    try {
      const raw = localStorage.getItem('carneiz_user') || localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.id || parsed._id)) {
          return parsed;
        }
      }
    } catch {}
    return null;
  };

  const fetchNotifications = useCallback(async (user?: StoredUser | null) => {
    const activeUser = user !== undefined ? user : getStoredUser();
    
    // Strictly require a logged-in user
    if (!activeUser || (!activeUser.email && !activeUser.id && !activeUser._id)) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const emailParam = activeUser.email ? `email=${encodeURIComponent(activeUser.email)}` : '';
      const idParam = (activeUser.id || activeUser._id) ? `userId=${encodeURIComponent(activeUser.id || activeUser._id || '')}` : '';
      const query = [emailParam, idParam].filter(Boolean).join('&');

      const res = await axios.get(`${apiUrl}/notifications/user?${query}`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error('Failed to load user notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    fetchNotifications(user);

    const handleUserChanged = () => {
      const updatedUser = getStoredUser();
      setCurrentUser(updatedUser);
      fetchNotifications(updatedUser);
    };

    window.addEventListener('carneiz_user_changed', handleUserChanged);
    window.addEventListener('storage', handleUserChanged);

    const interval = setInterval(() => {
      fetchNotifications(getStoredUser());
    }, 12000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('carneiz_user_changed', handleUserChanged);
      window.removeEventListener('storage', handleUserChanged);
    };
  }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      await axios.patch(`${apiUrl}/notifications/read-all`, {
        recipientType: 'user',
        email: currentUser.email,
        userId: currentUser.id || currentUser._id,
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const markSingleRead = async (item: NotificationItem) => {
    if (item.read) return;
    const notifId = item._id || item.id;
    if (!notifId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      await axios.patch(`${apiUrl}/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === notifId ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('carneiz_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setNotifications([]);
    window.dispatchEvent(new Event('carneiz_user_changed'));
  };

  const handleQuickLogin = (email: string, firstName: string, lastName: string) => {
    const userObj: StoredUser = { email, firstName, lastName };
    localStorage.setItem('carneiz_user', JSON.stringify(userObj));
    localStorage.setItem('user', JSON.stringify(userObj));
    setCurrentUser(userObj);
    setLoading(true);
    fetchNotifications(userObj);
    window.dispatchEvent(new Event('carneiz_user_changed'));
  };

  const filteredNotifs = filter === 'all' ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AccountLayout activeTab="notifications">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-w-[640px] shadow-sm">
        
        {/* If user is NOT logged in: Prompt to log in */}
        {!currentUser ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF4F4] flex items-center justify-center mb-5 text-[#8B1919] shadow-xs">
              <Lock className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h2 className="m-0 text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
              Please Log In to View Notifications
            </h2>
            <p className="text-gray-500 text-sm max-w-[420px] mb-6 leading-relaxed">
              Account notifications are private to each customer. Sign in to your Carneiz account to view order statuses, payment confirmations, and delivery PIN updates.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[340px] justify-center mb-6">
              <Link
                href="/login?redirect=/account/notifications"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#8B1919] hover:bg-[#6b1010] text-white px-6 py-2.5 rounded-xl font-bold text-sm no-underline transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In Now</span>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm no-underline transition-colors"
              >
                Create Account
              </Link>
            </div>

            {/* Quick Demo Switcher for fast verification */}
            <div className="pt-6 border-t border-gray-100 w-full text-center">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2.5">
                Quick Sign-in for Test Accounts
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tunde.test.11424@example.com', 'Tunde', 'Bakare')}
                  className="text-xs bg-gray-50 hover:bg-[#FDF4F4] text-gray-700 hover:text-[#8B1919] border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium"
                >
                  Sign in as Tunde Bakare
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('amaka.johnson@example.com', 'Amaka', 'Johnson')}
                  className="text-xs bg-gray-50 hover:bg-[#FDF4F4] text-gray-700 hover:text-[#8B1919] border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-medium"
                >
                  Sign in as Amaka Johnson
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* User IS Logged In */
          <>
            {/* Header Section */}
            <div className="p-6 sm:p-7 border-b border-gray-100">
              {/* Logged in User Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#8B1919] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.email}
                    </span>
                    <span className="text-[11px] text-gray-500 leading-tight">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#8B1919] bg-transparent border-none cursor-pointer p-1 transition-colors"
                  title="Sign out of this account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="font-semibold">Sign out</span>
                </button>
              </div>

              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="m-0 text-xl font-extrabold text-gray-900 tracking-tight">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-[#8B1919] text-white px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="bg-transparent border-none text-[#8B1919] font-bold cursor-pointer hover:underline text-sm p-0 transition-opacity"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {/* Tabs: [ All ] [ Unread ] */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-5 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                    filter === 'all' 
                      ? 'border-[#8B1919] bg-[#8B1919] text-white shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button 
                  onClick={() => setFilter('unread')} 
                  className={`px-5 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                    filter === 'unread' 
                      ? 'border-[#8B1919] bg-[#8B1919] text-white shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* List Section */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B1919]" />
                  <span className="text-gray-400 text-xs">Loading notifications for your account...</span>
                </div>
              ) : filteredNotifs.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium text-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span>
                    {filter === 'unread'
                      ? 'You have caught up with all notifications.'
                      : `No notifications recorded for ${currentUser.email} yet.`}
                  </span>
                  <p className="text-gray-400 text-xs mt-1.5 mb-0 max-w-xs">
                    Order confirmations, pickup PIN codes, and receipts will appear here as soon as they are generated.
                  </p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const isUnread = !notif.read;
                  const notifId = notif._id || notif.id;
                  return (
                    <div 
                      key={notifId} 
                      onClick={() => markSingleRead(notif)}
                      className={`p-5 sm:px-7 transition-colors cursor-pointer flex items-start gap-4 ${
                        isUnread ? 'bg-[#F4F5FD] hover:bg-[#EEF0FA]' : 'bg-white hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-3">
                          <div className="font-bold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                            <span>{notif.title}</span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#8B1919] inline-block shrink-0"></span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs font-medium whitespace-nowrap pt-0.5">
                            {formatRelativeTime(notif.createdAt)}
                          </div>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>
    </AccountLayout>
  );
}


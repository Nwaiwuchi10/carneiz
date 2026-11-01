"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, ExternalLink, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";

interface AdminNotification {
  _id: string;
  recipientType: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminNotificationsView() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminNotifications = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      const res = await axios.get(`${apiUrl}/notifications/admin`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Failed to fetch admin notifications:", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      await axios.patch(`${apiUrl}/notifications/read-all`, {
        recipientType: "admin",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed to mark all admin notifications as read:", e);
    }
  };

  const markSingleRead = async (item: AdminNotification) => {
    if (item.read) return;
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      await axios.patch(`${apiUrl}/notifications/${item._id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const filteredNotifs =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Bell className="text-[#8b181c]" size={26} />
            Notifications & System Alerts
          </h1>
          <p className="text-sm text-gray-500">
            Real-time feed of online checkouts, cash orders, customer registrations, and PIN delivery verifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminNotifications}
            className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Screenshot Replicated Card Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-2xl">
        {/* Card Header */}
        <div className="p-6 sm:p-7 border-b border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <h2 className="m-0 text-xl font-extrabold text-gray-900 tracking-tight">
                Notifications
              </h2>
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

          {/* Filter Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                filter === "all"
                  ? "border-[#8B1919] bg-[#8B1919] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-5 py-1.5 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                filter === "unread"
                  ? "border-[#8B1919] bg-[#8B1919] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1919]" />
              <span className="text-gray-400 text-xs">Loading notifications...</span>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium text-sm">
              {filter === "unread" ? "No unread alerts." : "No notifications captured yet."}
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isUnread = !notif.read;
              const cleanOrderRef = notif.metadata?.orderId
                ? notif.metadata.orderId.replace(/^#/, "")
                : "";

              return (
                <div
                  key={notif._id}
                  onClick={() => markSingleRead(notif)}
                  className={`p-6 sm:px-7 transition-colors cursor-pointer group ${
                    isUnread
                      ? "bg-[#F4F5FD] hover:bg-[#EEF0FA]"
                      : "bg-white hover:bg-gray-50/70"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-4">
                    <div className="font-bold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                      <span>{notif.title}</span>
                      {cleanOrderRef && (
                        <Link
                          href={`/admin/orders/${cleanOrderRef}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-xs text-[#8B1919] hover:underline"
                        >
                          <ExternalLink size={12} className="ml-1" />
                        </Link>
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

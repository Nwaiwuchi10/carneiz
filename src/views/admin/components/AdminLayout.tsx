"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ExternalLink, 
  ChevronRight,
  ShieldCheck,
  Loader2
} from "lucide-react";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [ordersBadge, setOrdersBadge] = useState<number | null>(null);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const notifRef = useRef<HTMLDivElement>(null);

  // Admin Auth Guard: verify presence and validity of admin credentials
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
        const userStr = localStorage.getItem("admin_user") || localStorage.getItem("user");

        if (!token || !userStr) {
          setIsAuthorized(false);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const parsedUser = JSON.parse(userStr);
        if (parsedUser.role !== "admin") {
          setIsAuthorized(false);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        setAdminUser(parsedUser);
        setIsAuthorized(true);

        // Verify token with backend
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
        const verifyRes = await fetch(`${apiUrl}/auth/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!verifyRes.ok) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          setIsAuthorized(false);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        const verifyData = await verifyRes.json();
        if (verifyData.user) {
          setAdminUser(verifyData.user);
          localStorage.setItem("admin_user", JSON.stringify(verifyData.user));
        }
      } catch {
        // Fallback: if network fails temporarily, keep cached session if valid
      }
    };

    checkAdminAuth();
  }, [pathname, router]);

  const handleSignOut = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === "admin") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch {}
    }
    setShowSignOutModal(false);
    router.replace("/admin/login");
  };

  const fetchStatsAndNotifs = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      
      // Fetch stats
      const statsRes = await fetch(`${apiUrl}/admin/dashboard/stats`);
      if (statsRes.ok) {
        const d = await statsRes.json();
        const pipeline = d.pipeline || [];
        const pending = (pipeline.find((p: any) => p.label === "Processing")?.value || 0) + 
                        (pipeline.find((p: any) => p.label === "New")?.value || 0);
        setOrdersBadge(pending > 0 ? pending : null);
      }

      // Fetch admin notifications
      const notifsRes = await fetch(`${apiUrl}/notifications/admin`);
      if (notifsRes.ok) {
        const notifData = await notifsRes.json();
        setAdminNotifs(notifData.data || []);
        setAdminUnreadCount(notifData.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchStatsAndNotifs();
      const interval = setInterval(fetchStatsAndNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const markAllAdminRead = async () => {
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientType: "admin" }),
      });
      setAdminNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      setAdminUnreadCount(0);
    } catch {}
  };

  const markSingleAdminRead = async (notif: any) => {
    if (!notif.read && notif._id) {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
        await fetch(`${apiUrl}/notifications/${notif._id}/read`, { method: "PATCH" });
        setAdminNotifs((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setAdminUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }

    if (notif.metadata?.orderId) {
      const cleanId = notif.metadata.orderId.replace(/^#/, "");
      router.push(`/admin/orders/${cleanId}`);
      setIsNotifOpen(false);
    } else if (notif.type === "account") {
      router.push("/admin/customers");
      setIsNotifOpen(false);
    }
  };

  const filteredNotifs =
    notifFilter === "all"
      ? adminNotifs
      : adminNotifs.filter((n) => !n.read);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: ordersBadge },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/admin/notifications", icon: Bell, badge: adminUnreadCount > 0 ? adminUnreadCount : null },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Auth checking loading state
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#110e0e] text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9a1a1e] font-bold text-white shadow-xl animate-pulse">
            C
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">Single Admin Console</h3>
            <div className="flex items-center gap-2 justify-center mt-2 text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e1a842]" />
              <span>Verifying administrator authorization...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized state
  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#111111] text-white flex-col h-full shrink-0 border-r-4 border-[#9a1a1e]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#e1a842] tracking-wider">ENGINE ROOM</span>
            <span className="text-[10px] bg-red-950 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-800/40">
              Admin
            </span>
          </div>
          <div className="text-sm text-gray-400">Single Admin Console</div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors no-underline ${
                  isActive ? "bg-[#9a1a1e] text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#cc2b30] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Authenticated Staff Card in Desktop Sidebar */}
        <div className="p-4 border-t border-gray-800">
          {adminUser && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-gray-900 border border-gray-800/80">
              <div className="w-8 h-8 rounded-full bg-[#9a1a1e] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {adminUser.firstName ? adminUser.firstName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName || ""}`.trim() : adminUser.email}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {adminUser.email}
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowSignOutModal(true)}
            className={`flex items-center gap-3 text-sm font-medium px-4 py-2.5 w-full rounded-md transition-colors cursor-pointer border-none ${
              showSignOutModal ? "bg-[#9a1a1e] text-white" : "text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
            }`}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-[#111111] text-white flex flex-col h-full shrink-0 border-r-4 border-[#9a1a1e] shadow-2xl animate-in slide-in-from-left">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-transparent border-none p-1 cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <div className="text-xs font-bold text-[#e1a842] tracking-wider mb-1">ENGINE ROOM</div>
              <div className="text-sm text-gray-400">Single Admin Console</div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors no-underline ${
                      isActive ? "bg-[#9a1a1e] text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#cc2b30] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800">
              {adminUser && (
                <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-900">
                  <div className="w-8 h-8 rounded-full bg-[#9a1a1e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {adminUser.firstName ? adminUser.firstName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName || ""}`.trim() : adminUser.email}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {adminUser.email}
                    </span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowSignOutModal(true);
                }}
                className={`flex items-center gap-3 text-sm font-medium px-4 py-2.5 w-full rounded-md transition-colors cursor-pointer border-none ${
                  showSignOutModal ? "bg-[#9a1a1e] text-white" : "text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
                }`}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 relative flex flex-col">
        
        {/* Top Header Bar for Desktop & Mobile */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
          {/* Left Title / Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1 bg-transparent border-none cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>Carneiz Admin</span>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-gray-900 font-bold capitalize">
                {pathname.replace("/admin/", "").replace("/", " • ") || "Dashboard"}
              </span>
            </div>
            <div className="sm:hidden text-sm font-bold text-gray-900">
              ENGINE ROOM
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-3 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </div>
          </div>

          {/* Right Controls: Staff Pill + Notification Bell + Storefront */}
          <div className="flex items-center gap-3 sm:gap-4 relative" ref={notifRef}>
            {/* Admin User Badge */}
            {adminUser && (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                <div className="w-5 h-5 rounded-full bg-[#9a1a1e] text-white flex items-center justify-center text-[10px] font-bold">
                  {adminUser.firstName ? adminUser.firstName.charAt(0).toUpperCase() : "A"}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {adminUser.firstName || "Admin"}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  (Staff)
                </span>
              </div>
            )}

            <Link 
              href="/" 
              target="_blank" 
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#8B1919] transition-colors bg-gray-100 hover:bg-gray-200/80 px-3 py-1.5 rounded-lg no-underline"
            >
              <span>View Storefront</span>
              <ExternalLink size={12} />
            </Link>

            {/* Notification Bell Button */}
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-none"
              aria-label="Admin Notifications"
            >
              <Bell size={20} />
              {adminUnreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#8B1919] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {adminUnreadCount > 9 ? "9+" : adminUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-[420px] bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Popover Header */}
                <div className="p-5 border-b border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2.5">
                      <h3 className="m-0 text-base font-extrabold text-gray-900 tracking-tight">
                        Notifications
                      </h3>
                      {adminUnreadCount > 0 && (
                        <span className="bg-[#8B1919] text-white px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide">
                          {adminUnreadCount} New
                        </span>
                      )}
                    </div>
                    {adminNotifs.length > 0 && adminUnreadCount > 0 && (
                      <button
                        onClick={markAllAdminRead}
                        className="bg-transparent border-none text-[#8B1919] font-bold cursor-pointer hover:underline text-xs p-0 transition-opacity"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Filter Pills: [ All ] [ Unread ] */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotifFilter("all")}
                      className={`px-4 py-1 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                        notifFilter === "all"
                          ? "border-[#8B1919] bg-[#8B1919] text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setNotifFilter("unread")}
                      className={`px-4 py-1 rounded-full font-bold text-xs cursor-pointer transition-all border ${
                        notifFilter === "unread"
                          ? "border-[#8B1919] bg-[#8B1919] text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {filteredNotifs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-medium text-xs">
                      {notifFilter === "unread" ? "No unread notifications." : "No notifications available."}
                    </div>
                  ) : (
                    filteredNotifs.slice(0, 15).map((notif) => {
                      const isUnread = !notif.read;
                      return (
                        <div
                          key={notif._id}
                          onClick={() => markSingleAdminRead(notif)}
                          className={`p-4 sm:px-5 transition-colors cursor-pointer group ${
                            isUnread
                              ? "bg-[#F4F5FD] hover:bg-[#EEF0FA]"
                              : "bg-white hover:bg-gray-50/80"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight leading-snug">
                              {notif.title}
                            </span>
                            <span className="text-gray-400 text-[11px] font-medium whitespace-nowrap pt-0.5">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs leading-relaxed m-0">
                            {notif.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-center">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-[#8B1919] hover:underline no-underline"
                  >
                    View All Notifications & Alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Sign Out Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <LogOut className="text-[#8b181c]" size={24} />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Sign out of Admin Console?</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                You will be logged out of the Engine Room Single Admin Console. You will need your administrative credentials to log back in.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm cursor-pointer border-none"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ChevronDown } from "lucide-react";
import { dashboardService } from "@/src/services/admin/dashboard.service";
import { ordersService } from "@/src/services/admin/orders.service";

export default function AdminDashboardView() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          dashboardService.getStats(),
          ordersService.getOrders()
        ]);
        setData(statsData);
        setRecentOrders(ordersData.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b181c]"></div>
      </div>
    );
  }

  const stats = [
    { label: "ORDERS TODAY", value: data.stats.ordersToday.value, change: data.stats.ordersToday.change, isPositive: data.stats.ordersToday.isPositive },
    { label: "REVENUE TODAY", value: `₦${data.stats.revenueToday.value.toLocaleString()}`, change: data.stats.revenueToday.change, isPositive: data.stats.revenueToday.isPositive },
    { label: "REVENUE THIS WEEK", value: `₦${data.stats.revenueThisWeek.value.toLocaleString()}`, change: data.stats.revenueThisWeek.change, isPositive: data.stats.revenueThisWeek.isPositive },
    { label: "REVENUE THIS MONTH", value: `₦${data.stats.revenueThisMonth.value.toLocaleString()}`, change: data.stats.revenueThisMonth.change, isPositive: data.stats.revenueThisMonth.isPositive },
  ];

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-red-50 text-red-600';
      case 'processing': return 'bg-blue-50 text-blue-600';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getPipelineColor = (label: string) => {
    switch(label.toLowerCase()) {
      case 'new': return "bg-[#7d191c]";
      case 'processing': return "bg-[#e26928]";
      case 'packed': return "bg-[#d59a29]";
      case 'out for delivery': return "bg-[#18488e]";
      case 'delivered': return "bg-[#256c2e]";
      case 'cancelled': return "bg-[#db3232]";
      case 'not listed': return "bg-gray-500";
      case 'payment pending': return "bg-[#6d8a96]";
      default: return "bg-gray-500";
    }
  };

  const getCartStatusColor = (status: string) => {
    if (status === 'Not contacted') return 'text-gray-500';
    if (status === 'Emailed') return 'text-[#d59a29]';
    return 'text-[#256c2e]';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500">Daily at-a-glance across the Carneiz store</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm no-underline">
            View storefront
          </Link>
          <Link href="/admin/orders" className="px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] transition-colors shadow-sm no-underline">
            Manage orders
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-2">{stat.value}</p>
            <div className={`flex items-center text-xs font-bold ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {stat.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {stat.change} <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-base font-bold text-gray-900">Revenue, last 14 days</h3>
          <div className="flex items-center gap-1 text-xs font-medium">
            {['1 Hour', '1 Day', '7 Days', '14 Days', '30 Days', '6 Months', 'Custom'].map((period) => (
              <button 
                key={period}
                className={`px-3 py-1.5 rounded-md transition-colors ${period === '14 Days' ? 'bg-[#401214] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 w-full relative mt-4">
          <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b181c" />
                <stop offset="100%" stopColor="#8b181c" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 150 L 100 130 L 200 160 L 300 120 L 400 180 L 500 100 L 600 150 L 700 80 L 800 100 L 900 60" 
              fill="none" 
              stroke="url(#lineGrad)" 
              strokeWidth="3" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            <circle cx="800" cy="100" r="5" fill="#e1a842" className="animate-pulse" />
          </svg>
          <div className="absolute top-1/2 left-[75%] -translate-y-[120%] -translate-x-1/2 bg-[#111] text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg">
            Day 11 (Jan 22)<br/>
            ₦520,400
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111] rotate-45" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-b border-gray-100 border-dashed" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Order Pipeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Today's order pipeline</h3>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Live Update</span>
          </div>
          
          <div className="space-y-4">
            {data.pipeline.map((item: any, index: number) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-32 font-medium text-gray-700">{item.label}</div>
                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden mr-4">
                  <div 
                    className={`h-full rounded-full ${getPipelineColor(item.label)}`} 
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
                <div className="w-6 text-right font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Abandoned carts</h3>
            <span className="text-xs text-gray-500">Last 24 hrs</span>
          </div>

          <div className="space-y-4">
            {data.abandonedCarts.map((cart: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{cart.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cart.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#8b181c]">₦{cart.amount.toLocaleString()}</p>
                  <p className={`text-[10px] font-bold mt-1 ${getCartStatusColor(cart.status)}`}>{cart.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Store Orders */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-gray-900">Recent Store Orders</h3>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Filter List
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-2">Order ID</th>
                <th className="pb-3 px-2">Customer</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Products</th>
                <th className="pb-3 px-2 text-right">Total</th>
                <th className="pb-3 px-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-2 font-bold text-[#8b181c]">
                    <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="hover:underline no-underline text-[#8b181c]">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-4 px-2 font-semibold text-gray-900">{order.customer}</td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBg(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-500">{order.products}</td>
                  <td className="py-4 px-2 text-right font-bold text-gray-900">₦{order.total.toLocaleString()}</td>
                  <td className="py-4 px-2 text-right text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar, ChevronDown, Loader2, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ordersService } from "@/src/services/admin/orders.service";
import { dashboardService } from "@/src/services/admin/dashboard.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminOrdersView() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  // Action Buttons Loading & Modal State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: "success" | "error" | "info"; message: string }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const statusParam = statusFilter !== "All statuses" ? statusFilter : undefined;
      const [ordersData, dashboardData] = await Promise.all([
        ordersService.getOrders({
          search: search.trim() || undefined,
          status: statusParam,
        }),
        dashboardService.getStats()
      ]);
      
      const ordersList = ordersData.data || [];
      setOrders(ordersList);
      setTotal(ordersData.total || ordersList.length);

      const pipeline = dashboardData.pipeline || [];
      const getCount = (label: string) => pipeline.find((p: any) => p.label === label)?.value || 0;

      setStats([
        { label: "TOTAL ORDERS", value: (ordersData.total || 0).toLocaleString(), subtext: "Total historical orders", dotColor: "bg-blue-500", subtextColor: "text-gray-500" },
        { label: "PENDING PROCESSING", value: getCount('Processing').toString(), subtext: "Active in kitchen", dotColor: "bg-yellow-500", subtextColor: "text-gray-500" },
        { label: "IN TRANSIT", value: getCount('Out for delivery').toString(), subtext: "Cold chain logistics", dotColor: "bg-purple-500", subtextColor: "text-gray-500" },
        { label: "DELIVERED", value: getCount('Delivered').toString(), subtext: "Successfully dropped off", dotColor: "bg-green-500", subtextColor: "text-green-600" },
      ]);
    } catch (error) {
      console.error("Failed to fetch orders or stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-red-50 text-red-600';
      case 'processing': return 'bg-blue-50 text-blue-600';
      case 'packed': return 'bg-amber-50 text-amber-700';
      case 'out for delivery': return 'bg-purple-50 text-purple-700';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0) {
      setModal({
        isOpen: true,
        type: "info",
        message: "Please select one or more orders to update their status.",
      });
      return;
    }

    setIsUpdatingStatus(true);
    try {
      for (const orderId of selectedOrders) {
        await ordersService.updateOrderStatus(orderId, { status: "Processing" });
      }
      await fetchOrders();
      setModal({
        isOpen: true,
        type: "success",
        message: `Successfully advanced ${selectedOrders.length} selected order(s) to 'Processing'.`,
      });
      setSelectedOrders([]);
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        message: err?.response?.data?.message || "Failed to update selected orders status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvHeader = "Order ID,Customer,Status,Products,Total,Date\n";
      const csvRows = orders.map(o => 
        `"${o.id}","${o.customer}","${o.status}","${o.products || ''}","${o.total}","${o.date}"`
      ).join("\n");
      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `carneiz_orders_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setModal({
        isOpen: true,
        type: "success",
        message: `Successfully exported ${orders.length} order records to CSV.`,
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        message: "Failed to export orders to CSV.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Response Message Modal */}
      <AdminResponseModal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Orders</h1>
          <p className="text-sm text-gray-500">Track orders across Carneiz store</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm no-underline">
            View storefront
          </Link>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
            <div className={`absolute top-5 right-5 w-2 h-2 rounded-full ${stat.dotColor}`}></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-2">{stat.value}</p>
            <p className={`text-xs font-medium ${stat.subtextColor}`}>{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Filters and Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
        {/* Filter Row 1 */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-gray-100">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Order ID, customer name or phone" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]"
              >
                <option>All statuses</option>
                <option>New</option>
                <option>Processing</option>
                <option>Packed</option>
                <option>Out for Delivery</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Order Type</label>
            <div className="relative">
              <select className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]">
                <option>All orders</option>
                <option>Standard Express</option>
                <option>Same-Day Delivery</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Timeframe</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Current Month"
                readOnly
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Filter Row 2 (Bulk actions) */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]"
              checked={selectedOrders.length === orders.length && orders.length > 0}
              onChange={toggleSelectAll}
            />
            Select All ({selectedOrders.length})
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkStatusUpdate}
              disabled={isUpdatingStatus || selectedOrders.length === 0}
              className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isUpdatingStatus && <Loader2 size={14} className="animate-spin text-[#8b181c]" />}
              <span>Advance to Processing</span>
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin text-[#8b181c]" /> : <Download size={14} />}
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-4 w-12"></th>
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Products</th>
                  <th className="py-4 px-4 text-right">Total</th>
                  <th className="py-4 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-[#8b181c] hover:underline">
                        <Link href={`/admin/orders/${encodeURIComponent(order.id)}`}>
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{order.customer}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBg(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{order.products}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">₦{order.total.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-gray-500">{order.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>Showing 1-{orders.length} of {total} orders</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 text-gray-700">Previous</button>
            <button className="px-3 py-1.5 border border-transparent bg-[#8b181c] text-white font-medium rounded-md">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

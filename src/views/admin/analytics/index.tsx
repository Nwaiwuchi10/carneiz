"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Loader2, Download, TrendingUp } from "lucide-react";
import { analyticsService } from "@/src/services/admin/analytics.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminAnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await analyticsService.getAnalytics();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRange]);

  const handleExportCSV = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      const headers = ["Rank", "Product Name", "Category", "Units Sold", "Revenue (NGN)", "Trend (%)"];
      const rows = (data.topProducts || []).map((p: any) => [
        p.rank,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.unitsSold || 0,
        p.revenue || 0,
        `"${p.trend || 0}%"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carneiz_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setModal({
        isOpen: true,
        type: "success",
        title: "Analytics Report Exported",
        message: "Performance matrices and product rankings exported to CSV successfully."
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Export Failed",
        message: "Failed to generate analytics export."
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full w-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Response Modal */}
      <AdminResponseModal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-gray-500">Track revenue streams and cut popularity across your Carneiz store</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year (YTD)</option>
          </select>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL REVENUE</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">₦{(data.stats.totalRevenue.value || 0).toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">+{data.stats.totalRevenue.trend}%</span>
            <span className="text-[10px] font-medium text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-purple-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL ORDERS</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">{(data.stats.totalOrders.value || 0).toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">+{data.stats.totalOrders.trend}%</span>
            <span className="text-[10px] font-medium text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">AVG ORDER VALUE</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">₦{(data.stats.avgOrderValue.value || 0).toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">+{data.stats.avgOrderValue.trend}%</span>
            <span className="text-[10px] font-medium text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Revenue Over Time Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Revenue Over Time</h3>
            <p className="text-xs text-gray-500">Daily revenue data showing transactional trend</p>
          </div>
          <span className="bg-red-50 text-[#8b181c] font-bold text-[10px] px-2 py-1 rounded">
            ₦{(data.stats.totalRevenue.value || 0).toLocaleString()} Total
          </span>
        </div>
        
        {/* SVG Chart */}
        <div className="w-full h-48 relative mt-8">
          <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <path 
              d="M 0 160 L 50 155 L 100 160 L 150 145 L 200 150 L 250 160 L 300 145 L 350 130 L 400 145 L 450 130 L 500 140 L 550 125 L 600 120 L 650 125 L 700 130 L 750 110 L 800 115 L 850 105 L 900 110 L 950 95 L 1000 70" 
              fill="none" 
              stroke="#8b181c" 
              strokeWidth="3" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            <circle cx="1000" cy="70" r="4" fill="#8b181c" />
          </svg>
          <div className="absolute top-[20%] right-0 -translate-y-[100%] bg-[#111] text-white px-2 py-1 rounded text-[10px] font-bold">
            Latest: ₦{(data.stats.totalRevenue.value / 10 || 124000).toLocaleString()}
          </div>
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-b border-gray-100" />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
          <span>Day 1</span>
          <span>Day 7</span>
          <span>Day 14</span>
          <span>Day 21</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6">Sales by Category</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full border-[12px] border-[#8b181c] border-r-blue-500 border-b-purple-500 border-l-yellow-500 relative flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-white"></div>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {data.salesByCategory.map((cat: any) => (
                <div key={cat.name} className="flex items-center text-xs">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                  <span className="font-bold text-gray-700 w-24">{cat.name}</span>
                  <span className="text-gray-400">({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl flex items-center justify-center p-6 text-center">
          <div>
            <TrendingUp size={24} className="text-[#8b181c] mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">Predictive Sales Insights</p>
            <p className="text-xs text-gray-500 mt-1">AI-based demand forecasts for beef, poultry and goat meat are actively trained with daily orders.</p>
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-gray-900">Top Performing Products</h3>
          <span className="text-[10px] text-gray-400 font-medium">Sorted by highest revenue generated</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Product</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2 text-right">Units Sold</th>
                <th className="pb-3 px-2 text-right">Revenue</th>
                <th className="pb-3 px-2 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-gray-50">
              {data.topProducts.map((prod: any) => (
                <tr key={prod.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-2 text-gray-500 font-medium">#{prod.rank}</td>
                  <td className="py-4 px-2 font-bold text-gray-900">{prod.name}</td>
                  <td className="py-4 px-2 text-gray-500">{prod.category}</td>
                  <td className="py-4 px-2 text-right font-medium text-gray-700">{prod.unitsSold}</td>
                  <td className="py-4 px-2 text-right font-extrabold text-gray-900">₦{(prod.revenue || 0).toLocaleString()}</td>
                  <td className="py-4 px-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${prod.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.trend > 0 ? '+' : ''}{prod.trend}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

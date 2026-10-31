"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Download, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { transactionsService } from "@/src/services/admin/transactions.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminTransactionsView() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalRevenue: 0, successfulPayments: 0, failedPayments: 0, pendingPayments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedGateway, setSelectedGateway] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action states
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const [statsRes, txnsRes] = await Promise.all([
        transactionsService.getStats(),
        transactionsService.getTransactions({ search: searchTerm.trim() })
      ]);
      setStats(statsRes);
      let list = txnsRes.data || [];
      if (selectedStatus !== "All") {
        list = list.filter((t: any) => t.status?.toLowerCase() === selectedStatus.toLowerCase());
      }
      if (selectedGateway !== "All") {
        list = list.filter((t: any) => t.gateway?.toLowerCase() === selectedGateway.toLowerCase());
      }
      if (selectedMethod !== "All") {
        list = list.filter((t: any) => t.paymentMethod?.toLowerCase().includes(selectedMethod.toLowerCase()));
      }
      setTransactions(list);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus, selectedGateway, selectedMethod]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const exportList = selectedIds.length > 0 
        ? transactions.filter(t => selectedIds.includes(t.id)) 
        : transactions;

      if (exportList.length === 0) {
        setModal({
          isOpen: true,
          type: "info",
          title: "No Records",
          message: "No transaction records found to export."
        });
        return;
      }

      const headers = ["Transaction ID", "Customer", "Payment Method", "Gateway", "Amount (NGN)", "Status", "Date"];
      const rows = exportList.map(t => [
        `"${t.id}"`,
        `"${(t.customer || '').replace(/"/g, '""')}"`,
        `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
        `"${(t.gateway || '').replace(/"/g, '""')}"`,
        t.amount || 0,
        `"${t.status || ''}"`,
        `"${t.date || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carneiz_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setModal({
        isOpen: true,
        type: "success",
        title: "Export Generated",
        message: `Successfully downloaded ${exportList.length} transaction entries.`
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Export Failed",
        message: "Failed to generate transactions report export."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedIds.length === 0) {
      setModal({
        isOpen: true,
        type: "info",
        title: "Select Transactions",
        message: "Please select at least one transaction to synchronize and update status."
      });
      return;
    }
    setIsUpdatingStatus(true);
    try {
      for (const id of selectedIds) {
        await transactionsService.updateTransactionStatus(id, 'Successful');
      }
      setModal({
        isOpen: true,
        type: "success",
        title: "Status Reconciled",
        message: `Updated and verified status for ${selectedIds.length} transaction(s) with payment gateway.`
      });
      fetchTransactions();
      setSelectedIds([]);
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: err?.response?.data?.message || "Failed to reconcile transaction status with gateway."
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBg = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Response Message Modal */}
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500">Track all payment activities and settlement gateways across Carneiz store</p>
        </div>
        <div>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL REVENUE</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">₦{(stats.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-[10px] font-medium text-gray-500">Cumulative net earnings YTD</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SUCCESSFUL PAYMENTS</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">{(stats.successfulPayments || 0).toLocaleString()}</p>
          <p className="text-[10px] font-medium text-gray-500">Fully captured checkout entries</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">FAILED PAYMENTS</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">{(stats.failedPayments || 0).toLocaleString()}</p>
          <p className="text-[10px] font-medium text-gray-500">Declined at payment gateway</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-yellow-500"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">PENDING PAYMENTS</p>
          <p className="text-2xl font-extrabold text-gray-900 mb-2">{(stats.pendingPayments || 0).toLocaleString()}</p>
          <p className="text-[10px] font-medium text-gray-500">Awaiting authorization webhook</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="TXN ID or customer name" 
              className="w-full pl-8 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
          <select 
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] appearance-none bg-white cursor-pointer"
          >
            <option value="All">All methods</option>
            <option value="Card">Card</option>
            <option value="Bank">Bank Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Gateway</label>
          <select 
            value={selectedGateway}
            onChange={e => setSelectedGateway(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] appearance-none bg-white cursor-pointer"
          >
            <option value="All">All gateways</option>
            <option value="Flutterwave">Flutterwave</option>
            <option value="Paystack">Paystack</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
          <select 
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] appearance-none bg-white cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col mt-4">
        
        {/* Actions row */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
            <input 
              type="checkbox" 
              checked={transactions.length > 0 && selectedIds.length === transactions.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]" 
            />
            Select All ({selectedIds.length} of {transactions.length})
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isUpdatingStatus ? <Loader2 size={14} className="animate-spin text-[#8b181c]" /> : <RefreshCw size={14} />}
              Update Status
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin text-[#8b181c]" /> : <Download size={14} />}
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b181c]"></div></div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-4 w-12"></th>
                  <th className="py-4 px-4">Transaction ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Payment Method</th>
                  <th className="py-4 px-4">Gateway</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-500">No transactions found matching criteria.</td></tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(txn.id)}
                          onChange={() => handleToggleSelect(txn.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]" 
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-[#8b181c] hover:underline cursor-pointer">
                        <Link href={`/admin/transactions/${txn.id}`}>{txn.id}</Link>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">{txn.customer}</td>
                      <td className="py-4 px-4 text-gray-500">{txn.paymentMethod}</td>
                      <td className="py-4 px-4 text-gray-500">{txn.gateway}</td>
                      <td className="py-4 px-4 font-extrabold text-gray-900">₦{(txn.amount || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusBg(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-right">{txn.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

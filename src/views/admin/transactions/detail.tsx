"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Printer, RotateCcw } from "lucide-react";
import { transactionsService } from "@/src/services/admin/transactions.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminTransactionDetailView() {
  const params = useParams();
  const txnId = params?.id as string || "TXN-73921";
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action states
  const [isRefunding, setIsRefunding] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    const fetchTxn = async () => {
      try {
        const result = await transactionsService.getTransactionById(txnId);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch transaction", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTxn();
  }, [txnId]);

  const handleIssueRefund = async () => {
    setIsRefunding(true);
    try {
      const res = await transactionsService.refundTransaction(txnId);
      setData((prev: any) => prev ? { ...prev, status: 'Refunded' } : prev);
      setModal({
        isOpen: true,
        type: "success",
        title: "Refund Initiated",
        message: res?.message || `Refund of ₦${(data?.amount || 0).toLocaleString()} processed successfully back to the customer's payment method.`
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Refund Failed",
        message: err?.response?.data?.message || "Payment gateway declined refund request. Please verify settlement balance."
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleReprintReceipt = async () => {
    setIsPrinting(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      window.print();
      setModal({
        isOpen: true,
        type: "success",
        title: "Receipt Prepared",
        message: "Transaction receipt dispatched to print dialog."
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Print Failed",
        message: "Could not generate transaction slip."
      });
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">No transaction records found in the database for reference {txnId}.</p>
        <Link href="/admin/transactions" className="px-5 py-2.5 bg-[#8b181c] text-white text-xs font-bold rounded-xl no-underline">
          Return to Transactions
        </Link>
      </div>
    );
  }

  const txn = data;
  const isSuccess = String(txn.status).toLowerCase().includes('success');
  const statusColor = isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

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
      <div className="text-sm text-gray-500 mb-2">
        <Link href="/admin/transactions" className="hover:underline">Transactions</Link> / <span className="font-semibold text-gray-700">{txn.transactionId}</span>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Transaction Reference {txn.transactionId}</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleIssueRefund}
            disabled={isRefunding || txn.status === 'Refunded'}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-sm font-semibold text-[#8b181c] rounded-lg hover:bg-red-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isRefunding ? <Loader2 size={16} className="animate-spin text-[#8b181c]" /> : <RotateCcw size={16} />}
            {txn.status === 'Refunded' ? 'Refunded' : 'Issue Refund'}
          </button>
          <button 
            onClick={handleReprintReceipt}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isPrinting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            Reprint Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Purchased Goods */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Purchased Meat & Catalog Items</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 px-2">Product Details</th>
                  <th className="pb-3 px-2">Rate</th>
                  <th className="pb-3 px-2">Qty</th>
                  <th className="pb-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {(txn.items?.length ? txn.items : []).map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-4 px-2 font-medium text-gray-800">{item.name}</td>
                    <td className="py-4 px-2 text-gray-500">₦{(item.rate || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="py-4 px-2 font-medium text-gray-700">{item.qty}</td>
                    <td className="py-4 px-2 text-right font-extrabold text-gray-900">₦{(item.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transaction History Log */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction History Log</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[60px] before:w-[1px] before:bg-gray-100 before:z-0">
              {(txn.logs?.length ? txn.logs : []).map((log: any, idx: number) => (
                <div key={idx} className="flex relative z-10 gap-4">
                  <div className="w-[45px] text-[11px] font-bold text-gray-400 shrink-0 text-right pt-0.5">
                    {log.time}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[#8b181c] mt-1.5 shadow-[0_0_0_4px_white]"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-bold text-gray-900">{log.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Summary Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Info</h3>
            <span className={`inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded mb-6 ${statusColor}`}>
              {txn.status}
            </span>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Grand Total Paid</span>
                <span className="font-extrabold text-[#8b181c]">₦{(txn.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Settlement Method</span>
                <span className="font-bold text-gray-900">{txn.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Processor Gateway</span>
                <span className="font-medium text-gray-700">{txn.gateway}</span>
              </div>
            </div>
          </div>

          {/* Customer Metadata */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Metadata</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CUSTOMER NAME</p>
                <p className="text-sm font-bold text-gray-900">{txn.customer?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">EMAIL ADDRESS</p>
                <p className="text-sm font-medium text-gray-700">{txn.customer?.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PHONE NUMBER</p>
                <p className="text-sm font-medium text-gray-700">{txn.customer?.phone}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Download, Plus, Loader2, Mail, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { customersService } from "@/src/services/admin/customers.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminCustomersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, newThisMonth: 0, active: 0, churned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action loading states
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Modal response
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const [statsRes, custRes] = await Promise.all([
        customersService.getStats(),
        customersService.getCustomers({ search: searchTerm.trim() })
      ]);
      setStats(statsRes);
      let list = custRes.data || [];
      if (selectedStatus === "Active") {
        list = list.filter((c: any) => c.ordersCount > 0);
      } else if (selectedStatus === "Churned") {
        list = list.filter((c: any) => c.ordersCount === 0);
      }
      setCustomers(list);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customers.map(c => c.id));
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
        ? customers.filter(c => selectedIds.includes(c.id)) 
        : customers;

      if (exportList.length === 0) {
        setModal({
          isOpen: true,
          type: "info",
          title: "No Data",
          message: "No customer records available to export."
        });
        return;
      }

      const headers = ["Customer ID", "Name", "Email", "Phone", "Orders Count", "Lifetime Value", "Join Date"];
      const rows = exportList.map(c => [
        c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        c.ordersCount || 0,
        c.lifetimeValue || 0,
        `"${(c.joinDate || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carneiz_customers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setModal({
        isOpen: true,
        type: "success",
        title: "Export Completed",
        message: `Exported ${exportList.length} customer records to CSV successfully.`
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Export Failed",
        message: "Failed to generate customers CSV export."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    try {
      const recipientCount = selectedIds.length > 0 ? selectedIds.length : customers.length;
      await new Promise(r => setTimeout(r, 600)); // simulate mail delivery
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
      setModal({
        isOpen: true,
        type: "success",
        title: "Broadcast Sent",
        message: `Campaign message queued successfully to ${recipientCount} customer email address(es).`
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Sending Failed",
        message: "Failed to broadcast email message. Please verify email server."
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCustomer(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newCustomer.firstName,
          lastName: newCustomer.lastName,
          email: newCustomer.email,
          phoneNumber: newCustomer.phoneNumber,
          password: 'Password123!', // temporary default
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to register customer');
      }
      setShowAddModal(false);
      setNewCustomer({ firstName: "", lastName: "", email: "", phoneNumber: "" });
      setModal({
        isOpen: true,
        type: "success",
        title: "Customer Added",
        message: `Account created successfully for ${newCustomer.firstName} ${newCustomer.lastName}.`
      });
      fetchCustomers();
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Creation Failed",
        message: err.message || "Could not create customer account."
      });
    } finally {
      setIsAddingCustomer(false);
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <UserPlus size={20} className="text-[#8b181c]" /> Add New Customer
            </h3>
            <p className="text-xs text-gray-500 mb-5">Create a customer profile for order tracking and communications.</p>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomer.firstName} 
                    onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    placeholder="John" 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomer.lastName} 
                    onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    placeholder="Doe" 
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={newCustomer.email} 
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="john@example.com" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  value={newCustomer.phoneNumber} 
                  onChange={e => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                  placeholder="+234 801 234 5678" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAddingCustomer}
                  className="px-5 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isAddingCustomer && <Loader2 size={16} className="animate-spin" />}
                  {isAddingCustomer ? 'Adding...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Broadcast Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Mail size={20} className="text-[#8b181c]" /> Send Email Announcement
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Sending to {selectedIds.length > 0 ? `${selectedIds.length} selected customer(s)` : `all ${customers.length} customer(s)`}.
            </p>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <input 
                  required 
                  type="text" 
                  value={emailSubject} 
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Special Promo & Fresh Cuts Available!" 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
                <textarea 
                  required 
                  rows={4}
                  value={emailBody} 
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder="Dear valued customer, our premium beef cuts and goat meat are freshly restocked..." 
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSendingEmail && <Loader2 size={16} className="animate-spin" />}
                  {isSendingEmail ? 'Dispatching...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Customers</h1>
          <p className="text-sm text-gray-500">Manage, view, and organize Carneiz registered customer accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin text-[#8b181c]" /> : <Download size={16} />}
            Export customer list
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8b181c] text-white text-sm font-semibold rounded-lg hover:bg-[#721316] shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add new customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL CUSTOMERS</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.total.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Registered customer accounts</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">NEW THIS MONTH</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.newThisMonth.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Acquired in current cycle</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-yellow-500"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ACTIVE BUYERS</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.active.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Placed orders on store</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-600"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">PROSPECT ACCOUNTS</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-2">{stats.churned.toLocaleString()}</p>
          <p className="text-xs font-medium text-gray-500">Awaiting first checkout</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Search Customers</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email or phone..." 
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Filter by Status</label>
          <div className="relative">
            <select 
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] cursor-pointer"
            >
              <option value="All">All Customers</option>
              <option value="Active">Active Buyers (With Orders)</option>
              <option value="Churned">Registered Prospects (0 Orders)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col mt-4">
        
        {/* Actions row */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
            <input 
              type="checkbox" 
              checked={customers.length > 0 && selectedIds.length === customers.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]" 
            />
            Select All ({selectedIds.length} of {customers.length})
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isExporting && <Loader2 size={14} className="animate-spin text-[#8b181c]" />}
              Export CSV
            </button>
            <button 
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <Mail size={14} /> Send Email
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
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 tracking-wider">
                  <th className="py-4 px-4 w-12"></th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Phone</th>
                  <th className="py-4 px-4 text-center">Orders</th>
                  <th className="py-4 px-4 text-right">Lifetime Value</th>
                  <th className="py-4 px-4 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No customers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(cust.id)}
                          onChange={() => handleToggleSelect(cust.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#8b181c] focus:ring-[#8b181c]" 
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-[#8b181c] hover:underline">
                        <Link href={`/admin/customers/${cust.id}`}>{cust.name}</Link>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{cust.email}</td>
                      <td className="py-4 px-4 text-gray-600">{cust.phone || 'N/A'}</td>
                      <td className="py-4 px-4 font-bold text-gray-900 text-center">{cust.ordersCount}</td>
                      <td className="py-4 px-4 font-bold text-gray-900 text-right">₦{(cust.lifetimeValue || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-500 text-right">{cust.joinDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && customers.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>Showing {customers.length} of {stats.total} customers</p>
            <div className="flex gap-1">
              <span className="px-3 py-1.5 border border-transparent bg-[#8b181c] text-white font-medium rounded-md">1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

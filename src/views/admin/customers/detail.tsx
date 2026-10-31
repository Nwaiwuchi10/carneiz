"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, X, Edit3, UserCheck } from "lucide-react";
import { customersService } from "@/src/services/admin/customers.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminCustomerDetailView() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Order History");

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Modal response
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await customersService.getCustomerById(customerId);
        setCustomer(data);
        setEditForm({
          name: data?.name || "",
          phone: data?.phone || "",
          address: data?.address || "Lagos, Nigeria",
        });
      } catch (error) {
        console.error("Failed to fetch customer", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await customersService.updateCustomer(customerId, {
        name: editForm.name,
        phone: editForm.phone,
      });
      setCustomer((prev: any) => ({
        ...prev,
        name: res?.data?.name || editForm.name,
        phone: res?.data?.phone || editForm.phone,
        address: editForm.address,
      }));
      setShowEditModal(false);
      setModal({
        isOpen: true,
        type: "success",
        title: "Profile Updated",
        message: `Customer profile for "${editForm.name}" updated successfully.`
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: err?.response?.data?.message || "Failed to update customer profile."
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" /></div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-gray-500">Customer not found</div>;
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 size={18} className="text-[#8b181c]" /> Edit Customer Profile
            </h3>
            <p className="text-xs text-gray-500 mb-5">Update contact details and preferences for this customer.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                <input 
                  type="text" 
                  value={editForm.address} 
                  onChange={e => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-[#8b181c] font-semibold mb-2 flex items-center cursor-pointer hover:underline" onClick={() => router.push('/admin/customers')}>
          <ChevronLeft size={16} /> Customers &gt; {customer.name}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{customer.name}</h1>
            <p className="text-sm text-gray-500">Carneiz Premium Member Profile</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/admin/customers')}
              className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
            >
              Back to All Customers
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-red-50 text-[#8b181c] rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md flex items-center justify-center font-black text-2xl">
              {customer.name?.slice(0, 2).toUpperCase() || "CZ"}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h2>
            <div className="inline-block px-3 py-1 bg-red-50 text-[#8b181c] text-[10px] font-bold uppercase tracking-wider rounded-full mb-6">
              VIP CUSTOMER
            </div>
            
            <div className="text-left space-y-4 mb-6 pt-6 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                <p className="text-sm font-semibold text-gray-900">{customer.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Loyalty Points</p>
                <p className="text-sm font-bold text-yellow-600">{customer.loyaltyPoints?.toLocaleString() || "1,240"} Points</p>
              </div>
            </div>

            <div className="text-left pt-6 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags & Segments</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">VIP</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">Retail Cuts</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">Active Buyer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs and Data */}
        <div className="lg:col-span-2">
          
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
            {["Order History", "Saved Addresses", "Wishlist Items", "Support Tickets"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${activeTab === tab ? 'text-[#8b181c] border-[#8b181c]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Order History" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500">
                      <th className="py-4 px-4">Order ID</th>
                      <th className="py-4 px-4">Products Purchased</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Total</th>
                      <th className="py-4 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {(!customer.orders || customer.orders.length === 0) ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No orders found for this customer.</td></tr>
                    ) : (
                      customer.orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-[#8b181c] hover:underline cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                            {order.id}
                          </td>
                          <td className="py-4 px-4 text-gray-600 truncate max-w-[200px]">{order.products}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-gray-900 text-right">₦{(order.total || 0).toLocaleString()}</td>
                          <td className="py-4 px-4 text-gray-500 text-right">{order.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== "Order History" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
              {activeTab} data will be displayed here as customer account interacts.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus, Phone, Loader2, X, CheckCircle2 } from 'lucide-react';
import AccountLayout from '@/src/components/Account/AccountLayout';

export interface AddressItem {
  id: string;
  title: string;
  isDefault: boolean;
  streetAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phoneNumber: string;
}

export default function SavedAddressesView() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Home',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phoneNumber: '',
    isDefault: false,
  });

  // Fetch addresses from backend or localStorage
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      const res = await axios.get(`${apiUrl}/users/addresses`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAddresses(res.data);
        localStorage.setItem('carneiz_saved_addresses', JSON.stringify(res.data));
      } else {
        const stored = localStorage.getItem('carneiz_saved_addresses');
        setAddresses(stored ? JSON.parse(stored) : []);
      }
    } catch (err) {
      const stored = localStorage.getItem('carneiz_saved_addresses');
      setAddresses(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      title: 'Home',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      phoneNumber: '',
      isDefault: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setFormData({
      title: addr.title,
      streetAddress: addr.streetAddress,
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      phoneNumber: addr.phoneNumber,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';

      if (editingAddressId) {
        // Edit existing address
        await axios.put(`${apiUrl}/users/addresses/${editingAddressId}`, formData);
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingAddressId) {
              return { ...a, ...formData };
            }
            return formData.isDefault ? { ...a, isDefault: false } : a;
          })
        );
        setToastMessage({ text: 'Address updated successfully!', type: 'success' });
      } else {
        // Add new address
        const res = await axios.post(`${apiUrl}/users/addresses`, formData);
        const created: AddressItem = {
          id: res.data?.id || `addr-${Date.now()}`,
          ...formData,
        };
        setAddresses((prev) => {
          const updated = formData.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
          return [...updated, created];
        });
        setToastMessage({ text: 'New address added successfully!', type: 'success' });
      }
      setModalOpen(false);
    } catch (err) {
      // Offline fallback
      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? { ...a, ...formData } : a))
        );
      } else {
        const fallbackId = `addr-${Date.now()}`;
        setAddresses((prev) => [...prev, { id: fallbackId, ...formData }]);
      }
      setModalOpen(false);
      setToastMessage({ text: 'Address saved locally!', type: 'success' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
      await axios.delete(`${apiUrl}/users/addresses/${idToDelete}`);
    } catch (e) {}

    setAddresses((prev) => prev.filter((a) => a.id !== idToDelete));
    setToastMessage({ text: 'Address removed.', type: 'success' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <AccountLayout activeTab="addresses">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' ? 'bg-[#7A1A1A] text-white' : 'bg-red-600 text-white'
        }`}>
          <span>✓</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#7A1A1A]" />
          <span className="text-gray-400 text-xs">Loading saved addresses...</span>
        </div>
      ) : (
        /* Address Cards Grid matching Image 2 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Header with Title, Default Badge, and Action Icons */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="m-0 text-base font-extrabold text-gray-900">
                      {address.title}
                    </h3>
                    {address.isDefault && (
                      <span className="bg-[#fff0f0] text-[#7A1A1A] font-bold text-[10px] px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Action Icons matching Image 2 */}
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <button
                      onClick={() => openEditModal(address)}
                      title="Edit Address"
                      className="p-1.5 hover:text-[#7A1A1A] hover:bg-gray-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      title="Delete Address"
                      className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-[#8B1919]" />
                    </button>
                  </div>
                </div>

                {/* Street Address */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0 mb-3 font-medium">
                  {address.streetAddress}
                </p>
              </div>

              {/* Phone with icon matching Image 2 */}
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pt-2 border-t border-gray-50">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{address.phoneNumber}</span>
              </div>
            </div>
          ))}

          {/* Add New Address Dashed Card matching Image 2 */}
          <div
            onClick={openAddModal}
            className="border-2 border-dashed border-[#7A1A1A]/30 hover:border-[#7A1A1A] bg-white rounded-2xl p-8 min-h-[160px] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#fdf5f5]/40 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#fdf5f5] text-[#7A1A1A] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-sm text-[#7A1A1A] tracking-wide">
              + Add New Address
            </span>
          </div>

        </div>
      )}

      {/* ========================================================
          ADD / EDIT ADDRESS MODAL
          ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 m-0">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Address Label (e.g. Home, Office, Mom's House)
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Home"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="124 Park Avenue, Apt 4B"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#7A1A1A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#7A1A1A] rounded border-gray-300 focus:ring-[#7A1A1A] cursor-pointer"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#7A1A1A] hover:bg-[#601414] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors uppercase tracking-wider shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Address'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </AccountLayout>
  );
}

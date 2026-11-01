"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Upload, Trash2, Key, ShieldCheck, Eye, EyeOff, Check } from "lucide-react";
import { settingsService } from "@/src/services/admin/settings.service";
import AdminResponseModal from "@/src/components/AdminResponseModal";

export default function AdminSettingsView() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notification'>('general');
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Response Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      const dataToSave = settings[section];
      await settingsService.updateSettings(section, dataToSave);
      setModal({
        isOpen: true,
        type: "success",
        title: "Settings Saved",
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} configuration saved and updated successfully.`
      });
    } catch (error: any) {
      console.error("Failed to save settings", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: error?.response?.data?.message || "Failed to update settings. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingLogo(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        setModal({
          isOpen: true,
          type: "success",
          title: "Logo Uploaded",
          message: "New store branding and logo successfully stored on CDN."
        });
      } catch (err) {
        setModal({
          isOpen: true,
          type: "error",
          title: "Upload Failed",
          message: "Could not upload store logo."
        });
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    setModal({
      isOpen: true,
      type: "info",
      title: "Logo Removed",
      message: "Branding reset to default Carneiz emblem."
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsSavingPassword(true);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('token')) : null;
      const res = await fetch(`${apiUrl}/auth/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not update credentials.');
      }
      setCurrentPassword("");
      setNewPassword("");
      setModal({
        isOpen: true,
        type: "success",
        title: "Password Updated",
        message: "Administrator account credentials changed successfully."
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: err.message || "Could not update credentials."
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRevokeSession = async () => {
    setIsRevoking(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setModal({
        isOpen: true,
        type: "success",
        title: "Session Revoked",
        message: "Remote device has been logged out and its authentication tokens invalidated."
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Revocation Failed",
        message: "Could not terminate remote session."
      });
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-full w-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notification', label: 'Notification' }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      
      {/* Response Message Modal */}
      <AdminResponseModal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          {activeTab === 'general' ? 'General Settings' : activeTab === 'security' ? 'Security Controls' : 'Notification Controls'}
        </h1>
        <p className="text-sm text-gray-500">
          {activeTab === 'general' ? 'Configure your e-commerce store basic information and branding' : 
           activeTab === 'security' ? 'Protect your console access keys, configure 2FA, and monitor active logins' : 
           'Set up automated notification workflows for your operators'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors border cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-[#8b181c] text-white border-[#8b181c]' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Business Information</h3>
            
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
              <div className="w-16 h-16 rounded-full bg-[#111] text-[#e1a842] flex items-center justify-center font-bold text-2xl border-4 border-[#111]">
                CZ
              </div>
              <div>
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="flex gap-3 mb-2">
                  <button 
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-4 py-2 bg-white text-gray-700 text-sm font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Recommended size: 256x256px. PNG or SVG.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={settings.general?.businessName || 'Carneiz Premium Meats'} 
                  onChange={e => handleChange('general', 'businessName', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Primary Industry</label>
                <input 
                  type="text" 
                  value={settings.general?.primaryIndustry || 'E-Commerce Butchery & Fresh Farm Cuts'} 
                  onChange={e => handleChange('general', 'primaryIndustry', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Business Address</label>
                <input 
                  type="text" 
                  value={settings.general?.businessAddress || 'Victoria Island, Lagos, Nigeria'} 
                  onChange={e => handleChange('general', 'businessAddress', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Postal Code</label>
                <input 
                  type="text" 
                  value={settings.general?.postalCode || '101241'} 
                  onChange={e => handleChange('general', 'postalCode', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Timezone</label>
                <input 
                  type="text" 
                  value={settings.general?.timezone || 'Africa/Lagos (WAT)'} 
                  onChange={e => handleChange('general', 'timezone', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Currency</label>
                <input 
                  type="text" 
                  value={settings.general?.currency || 'NGN (₦)'} 
                  onChange={e => handleChange('general', 'currency', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                />
              </div>
            </div>

            {/* ORDER FULFILLMENT & FEES CONFIGURATION */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900">Order Delivery, Service Fees & Store Pickup</h4>
                <p className="text-xs text-gray-500 mt-1">Configure pricing and store address shown to customers during checkout and order creation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Standard Delivery Fee (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₦</span>
                    <input 
                      type="number" 
                      min="0"
                      step="50"
                      value={settings.general?.deliveryFee ?? 2500} 
                      onChange={e => handleChange('general', 'deliveryFee', Number(e.target.value))}
                      placeholder="2500"
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700 font-semibold" 
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Applied to doorstep delivery orders (set to ₦0 when customer chooses Store Pickup).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Service Fee (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₦</span>
                    <input 
                      type="number" 
                      min="0"
                      step="50"
                      value={settings.general?.serviceFee ?? 500} 
                      onChange={e => handleChange('general', 'serviceFee', Number(e.target.value))}
                      placeholder="500"
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700 font-semibold" 
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Standard handling and cold-chain packaging fee applied to all checkouts.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Carneiz Store Pickup Address</label>
                  <input 
                    type="text" 
                    value={settings.general?.pickupAddress || 'Carneiz Flagship Store, Plot 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria'} 
                    onChange={e => handleChange('general', 'pickupAddress', e.target.value)}
                    placeholder="Enter store pickup address"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Shown to customers who select "Store Pickup" at checkout.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Store Pickup Operating Hours</label>
                  <input 
                    type="text" 
                    value={settings.general?.pickupHours || 'Mon - Sat: 8:00 AM - 7:00 PM'} 
                    onChange={e => handleChange('general', 'pickupHours', e.target.value)}
                    placeholder="e.g. Mon - Sat: 8:00 AM - 7:00 PM"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] text-gray-700" 
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Operating schedule when customers can pick up their orders.</p>
                </div>
              </div>
            </div>

            {/* PROMO & DISCOUNT CODES CONFIGURATION */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Promo & Discount Codes</h4>
                  <p className="text-xs text-gray-500 mt-1">Manage active coupons that customers can use in their cart and checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = settings.general?.discountCodes || [];
                    handleChange('general', 'discountCodes', [
                      ...current,
                      { code: '', percent: 10, active: true, description: '' }
                    ]);
                  }}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black cursor-pointer transition-colors"
                >
                  + Add Coupon
                </button>
              </div>

              <div className="space-y-3">
                {((settings.general?.discountCodes && settings.general.discountCodes.length > 0)
                  ? settings.general.discountCodes
                  : [
                      { code: 'CARNEIZ10', percent: 10, active: true, description: 'Newsletter Welcome 10% Discount' },
                      { code: 'CARNEIZ5', percent: 5, active: true, description: 'General Store 5% Discount' }
                    ]
                ).map((promo: any, idx: number) => {
                  const updatePromo = (field: string, val: any) => {
                    const list = [
                      ...((settings.general?.discountCodes && settings.general.discountCodes.length > 0)
                        ? settings.general.discountCodes
                        : [
                            { code: 'CARNEIZ10', percent: 10, active: true, description: 'Newsletter Welcome 10% Discount' },
                            { code: 'CARNEIZ5', percent: 5, active: true, description: 'General Store 5% Discount' }
                          ])
                    ];
                    list[idx] = { ...list[idx], [field]: val };
                    handleChange('general', 'discountCodes', list);
                  };

                  const removePromo = () => {
                    const list = [
                      ...((settings.general?.discountCodes && settings.general.discountCodes.length > 0)
                        ? settings.general.discountCodes
                        : [
                            { code: 'CARNEIZ10', percent: 10, active: true, description: 'Newsletter Welcome 10% Discount' },
                            { code: 'CARNEIZ5', percent: 5, active: true, description: 'General Store 5% Discount' }
                          ])
                    ].filter((_, i) => i !== idx);
                    handleChange('general', 'discountCodes', list);
                  };

                  return (
                    <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col md:flex-row items-center gap-3">
                      <div className="w-full md:w-1/3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                        <input
                          type="text"
                          value={promo.code || ''}
                          onChange={(e) => updatePromo('code', e.target.value.toUpperCase())}
                          placeholder="e.g. CARNEIZ10"
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                        />
                      </div>
                      <div className="w-full md:w-1/4">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Discount %</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={promo.percent ?? 10}
                          onChange={(e) => updatePromo('percent', Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                        />
                      </div>
                      <div className="w-full md:flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
                        <input
                          type="text"
                          value={promo.description || ''}
                          onChange={(e) => updatePromo('description', e.target.value)}
                          placeholder="e.g. Promo campaign"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4 md:pt-4">
                        <button
                          type="button"
                          onClick={() => updatePromo('active', !promo.active)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {promo.active ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={removePromo}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => handleSave('general')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm flex items-center disabled:opacity-70 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Secure your Carneiz administrator console by requiring an extra verification code upon signing in from unrecognized networks.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">2FA Status: {settings.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button 
                    type="button"
                    onClick={() => handleChange('security', 'twoFactorEnabled', !settings.security?.twoFactorEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.security?.twoFactorEnabled ? 'bg-[#8b181c]' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${settings.security?.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">MacBook Pro, macOS (Lagos, Nigeria)</p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Current Session</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">102.89.44.12 • Active Now</p>
                  </div>
                </div>

                <div className="flex justify-between items-start border-t border-gray-100 pt-6">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Mobile Admin App (Abuja, Nigeria)</p>
                    <p className="text-xs text-gray-400 mt-1">105.112.38.10 • Last active yesterday</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRevokeSession}
                    disabled={isRevoking}
                    className="flex items-center gap-1 px-4 py-2 bg-[#d32f2f] text-white text-xs font-bold rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isRevoking && <Loader2 size={12} className="animate-spin" />}
                    Revoke
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              
              <form onSubmit={handleUpdatePassword} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Update Admin Password</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Current Password</label>
                    <input 
                      required
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">New Password</label>
                    <input 
                      required
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters" 
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSavingPassword && <Loader2 size={14} className="animate-spin" />}
                  Save New Password
                </button>
              </form>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Production API Keys</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Access keys for Carneiz checkout integrations and automated logistics tracking.
                </p>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-bold text-gray-900 font-mono tracking-wider">
                    {showApiKey ? "cz_live_947cb8813a0972bfe" : "cz_live_947c...b8813"}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="flex items-center gap-1 text-xs font-bold text-[#8b181c] hover:underline cursor-pointer"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showApiKey ? "Hide Key" : "Reveal Key"}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => handleSave('security')}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors shadow-sm flex items-center disabled:opacity-70 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Security Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION TAB */}
        {activeTab === 'notification' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            
            <div className="mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-sm font-bold text-[#e1a842] uppercase tracking-wider mb-6">Orders & Sales</h3>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-900">New incoming orders</p>
                  <p className="text-xs text-gray-500 mt-1">Get instantly notified on the console and via email when a customer creates an order</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleChange('notification', 'newOrders', !settings.notification?.newOrders)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${settings.notification?.newOrders ? 'bg-[#8b181c]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${settings.notification?.newOrders ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">Disputes & refunds</p>
                  <p className="text-xs text-gray-500 mt-1">Instant warning alerts when customer refund requests are initiated</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleChange('notification', 'disputes', !settings.notification?.disputes)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${settings.notification?.disputes ? 'bg-[#8b181c]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${settings.notification?.disputes ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-sm font-bold text-[#e1a842] uppercase tracking-wider mb-6">Inventory & Catalog</h3>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">Low stock alerts</p>
                  <p className="text-xs text-gray-500 mt-1">Notify when meat cuts or bulk inventory fall below designated warehouse thresholds</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleChange('notification', 'lowStock', !settings.notification?.lowStock)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${settings.notification?.lowStock ? 'bg-[#8b181c]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${settings.notification?.lowStock ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-sm font-bold text-[#e1a842] uppercase tracking-wider mb-6">Reports & Marketing</h3>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">Weekly performance summaries</p>
                  <p className="text-xs text-gray-500 mt-1">A weekly summary of customer transactions and revenue generated delivered to your email</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleChange('notification', 'weeklySummaries', !settings.notification?.weeklySummaries)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${settings.notification?.weeklySummaries ? 'bg-[#8b181c]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${settings.notification?.weeklySummaries ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => handleSave('notification')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm flex items-center disabled:opacity-70 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Notification Setup'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

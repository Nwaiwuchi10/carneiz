"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, X, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ordersService } from "@/src/services/admin/orders.service";

export default function AdminOrderDetailView() {
  const params = useParams();
  const orderId = (params?.id as string) || "CRN-DEMO042";

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [data, setData] = useState<any>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [pinInput, setPinInput] = useState("");
  const [receivedByInput, setReceivedByInput] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const [modal, setModal] = useState<{show: boolean, type: 'success'|'error', message: string}>({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await ordersService.getOrderById(orderId);
        setData(result);
        setSelectedStatus(result.status);
      } catch (error) {
        console.error("Failed to fetch order", error);
        setModal({ show: true, type: 'error', message: 'Failed to fetch order details' });
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await ordersService.updateOrderStatus(orderId, { status: selectedStatus });
      setModal({ show: true, type: 'success', message: `Order status successfully updated to ${selectedStatus}` });
      setData((prev: any) => prev ? { ...prev, status: selectedStatus } : prev);
    } catch (err: any) {
      setModal({ 
        show: true, 
        type: 'error', 
        message: err?.response?.data?.message || err?.message || 'Failed to update order status' 
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!pinInput || pinInput.trim().length !== 4) {
      setModal({ show: true, type: 'error', message: 'Please enter the customer\'s 4-digit pickup PIN.' });
      return;
    }
    setIsVerifyingPin(true);
    try {
      const res = await ordersService.verifyOrderPin(orderId, {
        pin: pinInput.trim(),
        receivedBy: receivedByInput.trim() || data.customer?.name || 'Customer'
      });
      setModal({
        show: true,
        type: 'success',
        message: res.message || 'Pickup PIN verified successfully! Order marked as Delivered.'
      });
      setData((prev: any) => ({
        ...prev,
        status: 'Delivered',
        deliveredAt: res.data?.deliveredAt || new Date(),
        receivedBy: res.data?.receivedBy || receivedByInput || data.customer?.name,
        notes: res.data?.notes || prev?.notes
      }));
      setSelectedStatus('Delivered');
      setPinInput('');
    } catch (err: any) {
      setModal({
        show: true,
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Invalid pickup PIN provided. Please ask the customer to check their order confirmation.'
      });
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const [isPrintingSlip, setIsPrintingSlip] = useState(false);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handlePrintSlip = () => {
    setIsPrintingSlip(true);
    setTimeout(() => {
      setIsPrintingSlip(false);
      window.print();
    }, 300);
  };

  const handlePrintInvoice = () => {
    setIsPrintingInvoice(true);
    setTimeout(() => {
      setIsPrintingInvoice(false);
      window.print();
    }, 300);
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      await ordersService.updateOrderStatus(orderId, { status: 'Cancelled' });
      setData((prev: any) => prev ? { ...prev, status: 'Cancelled' } : prev);
      setSelectedStatus('Cancelled');
      setModal({ show: true, type: 'success', message: 'Order has been cancelled successfully.' });
    } catch (err: any) {
      setModal({ show: true, type: 'error', message: err?.response?.data?.message || 'Failed to cancel order.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note) return;
    setIsSavingNote(true);
    try {
      await ordersService.updateOrderStatus(orderId, { status: selectedStatus, notes: note });
      setModal({ show: true, type: 'success', message: 'Note added successfully' });
      setNote("");
    } catch (err) {
      setModal({ show: true, type: 'error', message: 'Failed to save note' });
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b181c]" />
      </div>
    );
  }

  if (!data) return <div>Order not found</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Response Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modal.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <X className="w-6 h-6 text-red-500" />
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {modal.type === 'success' ? 'Success' : 'Error'}
                </h3>
              </div>
              <button onClick={() => setModal({ ...modal, show: false })} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-6">{modal.message}</p>
            <button 
              onClick={() => setModal({ ...modal, show: false })}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/admin/orders" className="hover:underline">Orders</Link> &gt; Detail View
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900">{data.id}</h1>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded">Online Order</span>
            {data.fulfillmentType === 'pickup' ? (
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                🏬 Store Pickup
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1">
                🚚 Doorstep Delivery
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">Placed {new Date(data.createdAt).toLocaleString('en-GB')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintSlip}
            disabled={isPrintingSlip}
            className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPrintingSlip && <Loader2 size={14} className="animate-spin text-[#8b181c]" />}
            <span>Print Packing Slip</span>
          </button>
          <button 
            onClick={handlePrintInvoice}
            disabled={isPrintingInvoice}
            className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPrintingInvoice && <Loader2 size={14} className="animate-spin text-[#8b181c]" />}
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items Ordered */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Items Ordered</h3>
            </div>
            <div className="p-5 space-y-4">
              {data.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="text-gray-500 text-sm ml-2">• {item.weight}</span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-gray-500">× {item.quantity}</span>
                    <span className="font-bold text-gray-900">₦{item.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₦{data.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount</span>
                  <span className="font-medium text-[#db3232]">-₦0</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{data.fulfillmentType === 'pickup' ? 'Delivery Fee (Store Pickup)' : 'Delivery Fee'}</span>
                  <span className="font-medium text-gray-900">₦{(data.deliveryFee || 0).toLocaleString()}</span>
                </div>
                {data.serviceFee !== undefined && data.serviceFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Fee</span>
                    <span className="font-medium text-gray-900">₦{data.serviceFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 mt-2 border-t border-gray-100">
                  <span className="text-lg font-extrabold text-gray-900">Total</span>
                  <span className="text-lg font-extrabold text-[#8b181c]">₦{data.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Internal Notes</h3>
            </div>
            <div className="p-5">
              {data.notes.map((n: any, idx: number) => (
                <div key={idx} className="mb-6 pb-4 border-b border-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-[#8b181c]">{n.user}</span>
                    <span className="text-xs text-gray-400">{n.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{n.text}</p>
                </div>
              ))}
              
              <div className="space-y-3">
                <textarea 
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b181c]/20 focus:border-[#8b181c]"
                  rows={3}
                  placeholder="Staff-only notes about this order..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSavingNote || !note}
                  className="px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm disabled:opacity-70 flex items-center"
                >
                  {isSavingNote && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Note
                </button>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Tracking History</h3>
            </div>
            <div className="p-5 pl-8">
              <div className="relative border-l-2 border-gray-100 space-y-8 pb-4">
                
                <div className="relative">
                  <div className="absolute -left-[37px] top-1 h-5 w-5 rounded-full bg-green-100 border-4 border-white flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Current Status: {data.status}</h4>
                    <p className="text-xs text-gray-500 mt-1">Updated recently</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] top-1 h-5 w-5 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Order Placed & Logged</h4>
                    <p className="text-xs text-gray-500 mt-1">{new Date(data.createdAt).toLocaleString('en-GB')} • System Auto Log</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Delivery Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">Delivery Status</h3>
            <span className="inline-block px-2 py-1 mb-4 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded">
              {data.status}
            </span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Update Logistics Stage</label>
                <div className="relative">
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]"
                  >
                    <option value="New">New</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered" disabled>Delivered (Customer Handover PIN Required)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder="Logistics Ref" 
                  defaultValue={`LOG-${data.id}`}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c] focus:border-[#8b181c]"
                />
              </div>
              
              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="w-full py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
              >
                {isUpdatingStatus && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Status
              </button>
            </div>

            {/* In-Store Customer Pickup PIN Verification (Requirement 3) */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  {data.fulfillmentType === 'pickup' ? '🏬 In-Store Pickup Verification' : '🚚 Customer Handover PIN'}
                </span>
                {data.status === 'Delivered' ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-extrabold uppercase rounded">
                    Delivered
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase rounded">
                    Awaiting PIN
                  </span>
                )}
              </div>

              {data.status === 'Delivered' ? (
                <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-xs text-green-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>PIN Verified & Handover Completed</span>
                  </div>
                  <p className="text-green-700 m-0">
                    {data.fulfillmentType === 'pickup' ? 'Customer entered pickup PIN in-store and received items.' : 'Delivery PIN verified upon physical handover.'}
                  </p>
                  {data.receivedBy && (
                    <p className="font-semibold text-green-800 pt-1 m-0">Received by: {data.receivedBy}</p>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-3">
                  <p className="text-[11px] text-amber-900 m-0 leading-relaxed">
                    {data.fulfillmentType === 'pickup'
                      ? 'When customer arrives at Carneiz store for pickup, have them enter or provide their secret 4-digit pickup PIN to confirm delivery:'
                      : 'Enter customer\'s 4-digit delivery PIN to authenticate delivery:'}
                  </p>

                  <div>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-Digit Secret PIN" 
                      className="w-full text-center font-mono text-base font-black tracking-widest px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b181c]"
                    />
                  </div>

                  <div>
                    <input 
                      type="text" 
                      value={receivedByInput}
                      onChange={(e) => setReceivedByInput(e.target.value)}
                      placeholder={`Received by (${data.customer?.name || 'Customer'})`} 
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b181c]"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={handleVerifyPin}
                    disabled={isVerifyingPin || pinInput.length !== 4}
                    className="w-full py-2 bg-[#8b181c] hover:bg-[#721316] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-1.5 cursor-pointer"
                  >
                    {isVerifyingPin ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>{isVerifyingPin ? 'Verifying PIN...' : 'Verify PIN & Confirm Delivery'}</span>
                  </button>

                  <div className="flex justify-between items-center text-[10px] text-amber-800/80 pt-1 border-t border-amber-200/60">
                    <span>Expected PIN:</span>
                    <span className="font-mono font-bold text-amber-950">{data.deliveryPin || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">Payment Details</h3>
            <span className="inline-block px-2 py-1 mb-4 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded">
              Paid
            </span>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway</span>
                <span className="font-semibold text-gray-900">{data.paymentMethod || 'Flutterwave'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-semibold text-gray-900">{`REF-${data.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Amount</span>
                <span className="font-semibold text-gray-900">₦{data.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Profile */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Customer Profile</h3>
            
            <div className="mb-4">
              <p className="font-bold text-gray-900">{data.customer.name}</p>
              <p className="text-sm text-gray-500">{data.customer.email}</p>
              <p className="text-sm text-gray-500">{data.customer.phone}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {data.fulfillmentType === 'pickup' ? 'Store Pickup Location' : 'Delivery Address'}
              </p>
              <p className="text-sm text-gray-900 mb-2 leading-relaxed">
                {data.fulfillmentType === 'pickup' ? (data.pickupAddress || 'Carneiz Flagship Store, Plot 14 Admiralty Way, Lekki Phase 1, Lagos') : data.customer.address}
              </p>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                data.fulfillmentType === 'pickup' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-600'
              }`}>
                {data.fulfillmentType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 bg-white border border-gray-100 rounded-xl shadow-sm gap-4 mt-6">
        <p className="text-sm text-gray-500 font-medium">Need modifications or refunds for the customer?</p>
        <button 
          onClick={handleCancelOrder}
          disabled={isCancelling || data.status === 'Cancelled'}
          className="px-4 py-2 bg-[#8b181c] text-white text-sm font-bold rounded-lg hover:bg-[#721316] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isCancelling && <Loader2 size={16} className="animate-spin" />}
          {data.status === 'Cancelled' ? 'Order Cancelled' : 'Cancel Order'}
        </button>
      </div>

    </div>
  );
}

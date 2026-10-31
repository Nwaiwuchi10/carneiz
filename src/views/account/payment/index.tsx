"use client";

import React, { useState } from 'react';
import { CreditCard, Plus, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import AccountLayout from '@/src/components/Account/AccountLayout';

export default function PaymentMethodsView() {
  const [cards] = useState([
    {
      id: '1',
      brand: 'Mastercard',
      last4: '4288',
      exp: '11/27',
      isDefault: true,
      holder: 'Carneiz Valued Customer',
    },
    {
      id: '2',
      brand: 'Visa',
      last4: '8831',
      exp: '08/26',
      isDefault: false,
      holder: 'Carneiz Valued Customer',
    },
  ]);

  return (
    <AccountLayout activeTab="payment">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 m-0">Saved Payment Methods</h2>
            <p className="text-gray-500 text-xs sm:text-sm m-0 mt-0.5">
              Securely manage your debit/credit cards and payment gateways for faster checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('New payment method can be added during your next checkout via Paystack or Flutterwave secure gateway.')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1919] hover:bg-[#6b1010] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-2xl border transition-all ${
                card.isDefault
                  ? 'border-[#8B1919]/40 bg-gradient-to-br from-white to-[#fdf8f8] shadow-sm ring-1 ring-[#8B1919]/20'
                  : 'border-gray-200/80 bg-white shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
                    <CreditCard className="w-5 h-5 text-[#8B1919]" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">{card.brand}</span>
                    <span className="text-[11px] text-gray-400 block font-mono">•••• •••• •••• {card.last4}</span>
                  </div>
                </div>
                {card.isDefault ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#8B1919]/10 text-[#8B1919] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Default
                  </span>
                ) : null}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Expires {card.exp}</span>
                <span className="font-medium text-gray-700">{card.holder}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-900 block mb-0.5">256-Bit Bank-Grade Encryption</strong>
            Your payment details are tokenized and processed through PCI-DSS Level 1 certified gateways (Paystack & Flutterwave). Carneiz never stores raw card credentials.
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

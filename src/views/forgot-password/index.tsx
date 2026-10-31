"use client";

import React, { useState } from 'react';
import { authService } from '@/src/services/auth.service';
import Spinner from '@/src/components/Spinner';
import Modal from '@/src/components/Modal';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      setModal({ isOpen: true, message: res.message || 'Password reset link sent!' });
    } catch (error: any) {
      setModal({ isOpen: true, message: error.response?.data?.message || 'Failed to send reset link' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-5">
      <div className="bg-white p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[450px]">
        <h2 className="text-center m-0 mb-2 text-gray-900 text-2xl font-bold">Forgot Password</h2>
        <p className="text-center text-gray-600 text-[0.9rem] mb-8">Enter your email address to receive a password reset link.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Email Address</label>
            <input type="email" name="email" placeholder="e.g. customer@carneiz.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          
          <button type="submit" disabled={loading} className="mt-4 bg-[#8B1919] hover:bg-[#6b1010] text-white p-4 border-none rounded-md font-bold cursor-pointer flex justify-center gap-2.5 transition-colors duration-200 disabled:opacity-70">
            {loading ? <Spinner /> : 'SEND RESET LINK'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-[0.9rem] text-gray-600">
          Remembered your password? <a href="/login" className="text-[#8B1919] font-bold no-underline hover:underline">Log In</a>
        </p>
      </div>

      <Modal isOpen={modal.isOpen} message={modal.message} onClose={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
}

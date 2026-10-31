"use client";

import React, { useState, useEffect } from 'react';
import { authService } from '@/src/services/auth.service';
import Spinner from '@/src/components/Spinner';
import Modal from '@/src/components/Modal';

export default function ResetPassword() {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '' });
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setModal({ isOpen: true, message: 'Passwords do not match!' });
      return;
    }
    if (!token || !email) {
      setModal({ isOpen: true, message: 'Invalid or missing reset token.' });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, token, newPassword: formData.newPassword });
      setModal({ isOpen: true, message: res.message || 'Password reset successful!' });
    } catch (error: any) {
      setModal({ isOpen: true, message: error.response?.data?.message || 'Password reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-5">
      <div className="bg-white p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[450px]">
        <h2 className="text-center m-0 mb-2 text-gray-900 text-2xl font-bold">Reset Password</h2>
        <p className="text-center text-gray-600 text-[0.9rem] mb-8">Enter your new password below.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">New Password</label>
            <input type="password" name="newPassword" placeholder="Enter new password" value={formData.newPassword} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Confirm New Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          
          <button type="submit" disabled={loading} className="mt-4 bg-[#8B1919] hover:bg-[#6b1010] text-white p-4 border-none rounded-md font-bold cursor-pointer flex justify-center gap-2.5 transition-colors duration-200 disabled:opacity-70">
            {loading ? <Spinner /> : 'RESET PASSWORD'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-[0.9rem] text-gray-600">
          <a href="/login" className="text-[#8B1919] font-bold no-underline hover:underline">Back to Log In</a>
        </p>
      </div>

      <Modal isOpen={modal.isOpen} message={modal.message} onClose={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
}

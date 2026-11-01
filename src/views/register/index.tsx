"use client";

import React, { useState } from 'react';
import { authService } from '@/src/services/auth.service';
import Spinner from '@/src/components/Spinner';
import Modal from '@/src/components/Modal';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModal({ isOpen: true, message: 'Passwords do not match!' });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(formData);
      const userData = res.user || {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber,
      };
      localStorage.setItem('carneiz_user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('carneiz_user_changed'));
      }
      setModal({ isOpen: true, message: res.message || 'Registration successful! Welcome to Carneiz.' });
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/account/notifications';
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1200);
    } catch (error: any) {
      setModal({ isOpen: true, message: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-5 py-12">
      <div className="bg-white p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[450px]">
        <h2 className="text-center m-0 mb-2 text-gray-900 text-2xl font-bold">Create Account</h2>
        <p className="text-center text-gray-600 text-[0.9rem] mb-8">Join us for fresh farm-sourced premium meat cuts</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">First Name</label>
            <input type="text" name="firstName" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Last Name</label>
            <input type="text" name="lastName" placeholder="e.g. Doe" value={formData.lastName} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Email Address</label>
            <input type="email" name="email" placeholder="e.g. customer@carneiz.com" value={formData.email} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Phone Number</label>
            <input type="tel" name="phoneNumber" placeholder="e.g. 08012345678" value={formData.phoneNumber} onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Create a secure password" 
                value={formData.password} 
                onChange={handleChange} 
                required
                className="w-full p-3 pr-11 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold mb-1 text-gray-800">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Repeat your secure password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required
                className="w-full p-3 pr-11 border border-gray-300 rounded-md text-[0.95rem] outline-none transition-colors duration-200 focus:border-[#8B1919]" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="mt-4 bg-[#8B1919] hover:bg-[#6b1010] text-white p-4 border-none rounded-md font-bold cursor-pointer flex justify-center gap-2.5 transition-colors duration-200">
            {loading ? <Spinner /> : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center mt-6 text-[0.9rem] text-gray-600">
          Already have an account? <a href="/login" className="text-[#8B1919] font-bold no-underline hover:underline">Log In</a>
        </p>
        
        {/* Google OAuth (Temporarily commented out)
        <div className="flex items-center my-6">
          <hr className="flex-1 border-none border-t border-gray-200" />
          <span className="px-3 text-gray-400 text-[0.8rem] tracking-wider font-medium">OR SIGN UP WITH</span>
          <hr className="flex-1 border-none border-t border-gray-200" />
        </div>

        <button className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-md font-bold cursor-pointer flex justify-center items-center gap-2.5 transition-colors duration-200 text-gray-700">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" />
          Continue with Google
        </button>
        */}
      </div>

      <Modal isOpen={modal.isOpen} message={modal.message} onClose={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
}

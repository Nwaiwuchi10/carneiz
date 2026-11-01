"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/src/services/auth.service';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg(null);
    try {
      const res = await authService.login(formData);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      const userData = res.user || { email: formData.email.toLowerCase().trim() };
      localStorage.setItem('carneiz_user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('carneiz_user_changed'));
      }

      setResponseMsg({ text: res.message || 'Login successful! Welcome back to Carneiz.', type: 'success' });
      
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/account/notifications';
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch (error: any) {
      setResponseMsg({
        text: error.response?.data?.message || 'Invalid credentials. Please verify your email and password.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f7f7f8] p-4 sm:p-6">
      <div className="bg-white p-8 sm:p-11 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] w-full max-w-[460px] border border-gray-100">
        
        {/* Brand Logo & Header matching Screenshot 3 */}
        <div className="text-center mb-7">
          <span className="font-black text-[#7A1A1A] tracking-widest text-lg uppercase block mb-1.5">
            CARNEIZ.
          </span>
          <h1 className="m-0 text-gray-900 text-2xl sm:text-[26px] font-extrabold tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-0">
            Log in to manage your premium butchery orders
          </p>
        </div>

        {/* Dynamic Response Alert */}
        {responseMsg && (
          <div className={`mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            responseMsg.type === 'success' 
              ? 'bg-[#e8f9ed] text-[#16a34a] border border-[#bbf7d0]' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            <span>{responseMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{responseMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="e.g. customer@carneiz.com" 
              value={formData.email} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition-colors duration-200 focus:border-[#7A1A1A] bg-white" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#7A1A1A] font-bold no-underline hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm outline-none transition-colors duration-200 focus:border-[#7A1A1A] bg-white" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* LOG IN Action Button matching Screenshot 3 */}
          <button 
            type="submit" 
            disabled={loading} 
            className="mt-2 w-full py-3.5 bg-[#7A1A1A] hover:bg-[#601414] text-white border-none rounded-xl font-bold cursor-pointer flex justify-center items-center gap-2 transition-colors duration-200 text-sm tracking-wider uppercase shadow-sm disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>LOGGING IN...</span>
              </>
            ) : (
              'LOG IN'
            )}
          </button>

          {/* CREATE ACCOUNT Button matching Screenshot 3 */}
          <Link 
            href="/register" 
            className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#7A1A1A] border border-[#7A1A1A] rounded-xl font-bold cursor-pointer transition-colors duration-200 text-center text-sm tracking-wider uppercase no-underline block"
          >
            CREATE ACCOUNT
          </Link>
        </form>

        {/* Google OAuth (Temporarily commented out)
        <div className="flex items-center my-6">
          <hr className="flex-1 border-none border-t border-gray-100" />
          <span className="px-3 text-gray-400 text-[10px] tracking-wider uppercase font-semibold">
            OR CONNECT WITH
          </span>
          <hr className="flex-1 border-none border-t border-gray-100" />
        </div>

        <button 
          type="button" 
          onClick={() => setResponseMsg({ text: 'Google OAuth redirection in progress...', type: 'success' })}
          className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold cursor-pointer flex justify-center items-center gap-3 transition-colors duration-200 text-gray-700 text-sm shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>
        */}

        <p className="text-center mt-6 text-xs text-gray-500 mb-0">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#7A1A1A] font-bold no-underline hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

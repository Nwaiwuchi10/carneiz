"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    try {
      const token = localStorage.getItem("admin_token");
      const userStr = localStorage.getItem("admin_user");
      if (token && userStr) {
        const u = JSON.parse(userStr);
        if (u.role === "admin") {
          router.replace("/admin/dashboard");
        }
      }
    } catch {}
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://carneiz-backend.vercel.app');
      const cleanEmail = email.trim().toLowerCase();

      const res = await fetch(`${apiUrl}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid administrative credentials");
      }

      if (!data.user || data.user.role !== "admin") {
        throw new Error("Access denied. Administrator privileges required.");
      }

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("admin_user_changed"));
        }
      }

      setSuccessMsg("Authentication successful! Loading Single Admin Console...");

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = params?.get("redirect") || "/admin/dashboard";

      setTimeout(() => {
        router.push(redirectUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please check your administrative credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword("Admin12345!");
    setErrorMsg(null);
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left side - Dark aesthetic */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-[#110e0e] text-white">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#110e0e] via-[#110e0e]/80 to-transparent z-0" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#9a1a1e] font-bold text-white shadow-md">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Carneiz</h1>
            <p className="text-[10px] font-semibold text-[#e1a842] tracking-widest uppercase">Premium Butchery & Cold-Chain</p>
          </div>
        </div>

        {/* Main Text */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-semibold mb-6">
            <ShieldCheck size={14} />
            <span>Single Admin Command</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            The Engine Room of <br /> Premium Freshness
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            Manage inventory cuts, fulfill doorstep and store pickup orders, configure delivery routes, review customer accounts, and monitor live sales telemetry.
          </p>
          <div className="h-1 w-16 bg-[#e1a842] rounded-full" />
        </div>

        {/* Bottom Specs */}
        <div className="relative z-10 flex gap-12 text-sm">
          <div>
            <p className="text-[10px] font-bold text-[#e1a842] tracking-wider uppercase mb-1">Security Standard</p>
            <p className="font-medium text-gray-200">Role-Based Access Control</p>
          </div>
          <div className="w-px h-10 bg-gray-700" />
          <div>
            <p className="text-[10px] font-bold text-[#e1a842] tracking-wider uppercase mb-1">Operations</p>
            <p className="font-medium text-gray-200">Live Cold-Chain Dispatch</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white relative">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#9a1a1e] text-xs font-bold tracking-wider uppercase rounded-full border border-red-100 mb-4">
              <ShieldCheck size={14} />
              <span>Admin Portal</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Staff Sign In</h2>
            <p className="text-gray-500 text-sm">
              Enter your authorized staff credentials to access the Carneiz Single Admin Console.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@carneiz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a1a1e]/20 focus:border-[#9a1a1e] text-sm text-gray-900 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Administrative Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9a1a1e]/20 focus:border-[#9a1a1e] text-sm text-gray-900 transition-colors bg-white pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#8b181c] hover:bg-[#721316] text-white font-bold rounded-xl transition-colors flex items-center justify-center shadow-sm disabled:opacity-70 cursor-pointer text-sm tracking-wide mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                "Authenticate & Open Console"
              )}
            </button>

            {/* Quick Demo Credentials for One-Click Testing */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
                Authorized Admin Accounts (Click to Pre-fill)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@carneiz.com")}
                  className="p-2.5 rounded-lg border border-gray-200 hover:border-[#8b181c] bg-gray-50/70 hover:bg-red-50/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-[#8b181c]">
                    Carneiz Admin
                  </span>
                  <span className="block text-[11px] text-gray-500 truncate">
                    admin@carneiz.com
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("operations@carneiz.com")}
                  className="p-2.5 rounded-lg border border-gray-200 hover:border-[#8b181c] bg-gray-50/70 hover:bg-red-50/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-[#8b181c]">
                    Operations Lead
                  </span>
                  <span className="block text-[11px] text-gray-500 truncate">
                    operations@carneiz.com
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center w-full max-w-md border-t border-gray-100 pt-5">
          <p className="text-[11px] text-gray-400 m-0">
            © 2026 Carneiz Ltd. Synchronized with live Mongo backend & JWT RBAC.
          </p>
        </div>
      </div>
    </div>
  );
}


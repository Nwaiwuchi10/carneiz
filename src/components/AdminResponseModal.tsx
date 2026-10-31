"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface AdminResponseModalProps {
  isOpen: boolean;
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  autoCloseDuration?: number; // duration in ms, defaults to 3000ms (0 to disable)
}

export default function AdminResponseModal({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
  confirmText = "Continue",
  autoCloseDuration = 3000,
}: AdminResponseModalProps) {
  useEffect(() => {
    if (!isOpen || !autoCloseDuration || autoCloseDuration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  const resolvedTitle = title || (type === "success" ? "Success" : type === "error" ? "Action Failed" : "Notification");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            type === "success" 
              ? "bg-[#e8f9ed] text-[#16a34a]" 
              : type === "error" 
              ? "bg-[#fde8e8] text-[#e02424]" 
              : "bg-blue-50 text-blue-600"
          }`}>
            {type === "success" && <CheckCircle2 size={32} />}
            {type === "error" && <AlertCircle size={32} />}
            {type === "info" && <Info size={32} />}
          </div>

          <h3 className="text-lg font-black text-gray-900 m-0 mb-2">
            {resolvedTitle}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0 mb-6 font-medium">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer border-none text-white ${
              type === "error"
                ? "bg-[#e02424] hover:bg-[#c81e1e]"
                : "bg-[#8b181c] hover:bg-[#721316]"
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

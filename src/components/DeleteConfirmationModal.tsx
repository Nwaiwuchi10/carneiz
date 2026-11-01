"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative animate-in zoom-in-95 duration-200 border border-gray-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-40"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
          <Trash2 size={24} className="stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-gray-900 m-0 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs text-gray-500 leading-relaxed m-0 mb-2">
          {message}
        </p>

        {/* Optional Highlighted Item Name */}
        {itemName && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 mb-5 text-xs font-bold text-gray-800 truncate">
            {itemName}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

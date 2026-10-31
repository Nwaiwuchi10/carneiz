import React from 'react';

export default function Modal({ isOpen, message, onClose }: { isOpen: boolean, message: string, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-8 rounded-lg max-w-[400px] w-[90%] text-center shadow-xl">
        <h3 className="m-0 mb-4 text-gray-800 text-xl font-bold">Notification</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <button 
          onClick={onClose}
          className="bg-[#8B1919] hover:bg-[#6b1010] text-white border-none py-2 px-6 rounded font-bold cursor-pointer transition-colors shadow-sm"
        >
          OK
        </button>
      </div>
    </div>
  );
}

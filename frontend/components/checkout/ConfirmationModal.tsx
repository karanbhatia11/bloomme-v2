"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  subtitle,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white rounded-3xl border-2 border-[#d1c5b3]/30 shadow-2xl p-8 space-y-6">
        {/* Content */}
        <div className="space-y-3 text-center">
          <h3 className="text-2xl font-bold text-[#2f1500] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="font-['Playfair_Display'] italic text-[#775a11] text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className={`flex-1 px-6 py-3 rounded-full text-white font-bold text-sm tracking-tight transition-all ${
              isDangerous
                ? "bg-gradient-to-r from-[#ab3500] to-[#d97706] hover:scale-[1.02] active:scale-95"
                : "bg-gradient-to-r from-[#775a11] to-[#c4a052] hover:scale-[1.02] active:scale-95"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-full border-2 border-[#d1c5b3] text-[#775a11] font-bold text-sm tracking-tight hover:bg-[#fff1e9] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}

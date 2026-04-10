"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface StickyCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StickyCart({ isOpen, onClose }: StickyCartProps) {
  const router = useRouter();
  const { cart, getTotal, clearCart, addAddon, removeAddon, removePlan } = useCart();

  const addonCount = cart.addons.reduce((s, a) => s + a.quantity, 0);

  // Show empty state if no plan AND no addons
  if (!cart.planId && addonCount === 0) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />
        )}

        {/* Empty Cart Panel */}
        {isOpen && (
          <div className="fixed top-24 left-4 right-4 sm:right-6 sm:left-auto max-w-[90vw] sm:max-w-sm md:w-80 bg-white rounded-2xl border-2 border-[#d1c5b3]/30 shadow-2xl p-6 sm:p-8 z-50 flex flex-col items-center justify-center gap-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center space-y-3">
              <span className="material-symbols-outlined text-6xl text-[#c4a052]">shopping_basket</span>
              <p className="text-lg font-bold text-[#2f1500]">Your ritual is waiting on you</p>
              <p className="text-sm text-[#4d4638]/70">Start your journey with Bloomme</p>
            </div>
            <Link
              href="/checkout/plan"
              onClick={onClose}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-sm text-center tracking-tight hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add Now →
            </Link>
          </div>
        )}
      </>
    );
  }
  const frequencyLabel =
    cart.frequency === "daily" ? "Daily" :
    cart.frequency === "alternate" ? "Alternate" :
    cart.deliveryDays.length === 2 && cart.deliveryDays.includes(0) && cart.deliveryDays.includes(6) ? "Weekends" :
    "Weekly";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Dropdown Panel from header */}
      {isOpen && (
        <div className="fixed top-24 left-4 right-4 sm:right-6 sm:left-auto max-w-[90vw] sm:max-w-sm md:w-80 bg-white rounded-2xl border-2 border-[#d1c5b3]/30 shadow-2xl p-4 sm:p-6 space-y-4 z-50 max-h-[80vh] overflow-y-auto">
          {/* Plan Section - only show if plan exists */}
          {cart.planId && (
          <div className="border-b border-[#d1c5b3]/20 pb-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50">Plan</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removePlan()}
                  className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#ffdcc3] text-[#775a11] font-bold flex items-center justify-center hover:bg-[#c4a052] hover:text-white transition-colors text-sm"
                  title="Remove plan"
                >
                  −
                </button>
              </div>
            </div>
            <p className="text-lg font-bold text-[#2f1500]">{cart.planName}</p>
            <p className="text-sm text-[#4d4638]/70 mt-1">₹{cart.planPrice} base</p>
          </div>
          )}

          {/* Schedule Section - only show if plan exists */}
          {cart.planId && (
          <div className="border-b border-[#d1c5b3]/20 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-2">Schedule</p>
            <p className="text-sm font-semibold text-[#2f1500]">{frequencyLabel}</p>
            {cart.selectedDeliveryDatesCount > 0 && (
              <p className="text-xs text-[#4d4638]/70 mt-1">{cart.selectedDeliveryDatesCount} delivery dates</p>
            )}
            {cart.startDate && (
              <p className="text-xs text-[#4d4638]/70 mt-1">
                From {new Date(cart.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>
          )}

          {/* Add-ons Section */}
          {addonCount > 0 && (
            <div className="border-b border-[#d1c5b3]/20 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-3">Add-ons</p>
              <div className="space-y-3">
                {cart.addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2f1500]">{addon.title}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeAddon(addon.id)}
                        className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#ffdcc3] text-[#775a11] font-bold flex items-center justify-center hover:bg-[#c4a052] hover:text-white transition-colors text-sm min-w-[2rem]"
                      >
                        −
                      </button>
                      <span className="w-8 sm:w-6 text-center text-sm font-bold text-[#2f1500]">{addon.quantity}</span>
                      <button
                        onClick={() => addAddon({ id: addon.id, title: addon.title, price: addon.price, image: addon.image })}
                        className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#ffdcc3] text-[#775a11] font-bold flex items-center justify-center hover:bg-[#c4a052] hover:text-white transition-colors text-sm min-w-[2rem]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="bg-[#ffdcc3]/30 rounded-xl p-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4638]/50 mb-2">Total</p>
            <p className="text-3xl font-extrabold text-[#2f1500]">₹{getTotal()}</p>
          </div>

          {/* Quick Checkout Button */}
          <button
            onClick={() => {
              onClose();
              router.push("/checkout/pay");
            }}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all"
          >
            Quick Checkout →
          </button>

          {/* Continue Shopping Link */}
          <Link href="/checkout/plan" onClick={onClose} className="block w-full text-center py-2 text-sm text-[#775a11] hover:text-[#c4a052] font-semibold transition-colors">
            Edit Order
          </Link>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface CheckoutHeaderProps {
  isCartOpen: boolean;
  onCartToggle: () => void;
}

export default function CheckoutHeader({ isCartOpen, onCartToggle }: CheckoutHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="bg-[#fff8f5] sticky top-0 z-50 border-b border-[#d1c5b3]/20">
      <div className="flex items-center justify-between h-28 w-full max-w-7xl mx-auto px-6 relative">
        {/* Left corner: Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img
            alt="Bloomme Logo"
            className="h-32 w-auto object-contain"
            src="/images/backgroundlesslogo.png"
          />
        </Link>

        {/* Right: Cart button + Account button / Login button */}
        <div className="flex items-center gap-4 relative">
          {/* Cart Button */}
          <button onClick={onCartToggle} className="text-[#775a11] hover:opacity-80 transition-opacity text-2xl">
            <span className="material-symbols-outlined">shopping_basket</span>
          </button>

          {/* Account Button (only if logged in) */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="h-10 w-10 rounded-full bg-[#ffdcc3] text-[#775a11] font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-[#775a11] transition-all"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#d1c5b3]/30 p-3 z-50">
                  <p className="text-sm font-medium text-[#2f1500] mb-3">{user.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-[#ab3500] hover:bg-[#ab3500]/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="px-6 py-2 rounded-full bg-[#775a11] text-white font-semibold text-sm hover:bg-[#c4a052] transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

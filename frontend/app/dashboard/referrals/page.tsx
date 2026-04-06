"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  status: "credited" | "pending";
  creditEarned: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      // Read referral code from localStorage (same as dashboard)
      if (userData.referralCode) {
        setReferralCode(userData.referralCode);
      }
      // Fetch referrals from API
      fetchReferrals(token);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, []);

  const fetchReferrals = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/referrals/overview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }

      const data = await response.json();
      setReferrals(
        data.referrals?.map((ref: any) => ({
          id: ref.referred_user_id,
          name: ref.name || "Unknown",
          email: ref.email || "N/A",
          dateJoined: new Date(ref.created_at).toLocaleDateString("en-IN"),
          status: ref.status === "completed" ? "credited" : "pending",
          creditEarned: ref.status === "completed" ? 50 : 0,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching referrals:", error);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = referrals.reduce((sum, ref) => sum + ref.creditEarned, 0);
  const successfulReferrals = referrals.filter((ref) => ref.status === "credited").length;
  const pendingCredit = referrals.filter((ref) => ref.status === "pending").length * 50;

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-on-surface-variant">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              alt="Bloomme Logo"
              className="h-12 w-auto object-contain"
              src="/images/backgroundlesslogo.png"
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">
              Referrals
            </a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowCart(false);
                  setShowProfile(false);
                }}
              >
                notifications
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>

            {/* Shopping Cart Dropdown */}
            <div className="relative">
              <span
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setShowCart(!showCart);
                  setShowNotifications(false);
                  setShowProfile(false);
                }}
              >
                shopping_cart
              </span>
              {showCart && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">Your cart is empty</p>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div
                className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                  setShowCart(false);
                }}
              >
                <img
                  alt="User profile avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGCW-2Yg-NfYjvjLMP5mjP8d1L0cygpIsoBCu_DLMevAPbeW6H-8_HIlvhViti-HMJICGXqq7FpY6YqmE2peGWZlqDr7Iirxtncmch1qEfWH_vLzdiOF1Luh1Oq8VDCwXD6GtPinM7VGqYjiq1HffL5N7vBJE_vxr2Xy1cZMqgaFj_5ZvqeEECObl0iBkzpNfMFjad91kXlqPIT_djKcN8y9MwSQ8KgXDQcN_UYeXU9gtRezXaNFlOkKD1SXQrJcINvMgsXgCwe-r"
                />
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
                      <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden">
                        <img
                          alt="User profile"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGCW-2Yg-NfYjvjLMP5mjP8d1L0cygpIsoBCu_DLMevAPbeW6H-8_HIlvhViti-HMJICGXqq7FpY6YqmE2peGWZlqDr7Iirxtncmch1qEfWH_vLzdiOF1Luh1Oq8VDCwXD6GtPinM7VGqYjiq1HffL5N7vBJE_vxr2Xy1cZMqgaFj_5ZvqeEECObl0iBkzpNfMFjad91kXlqPIT_djKcN8y9MwSQ8KgXDQcN_UYeXU9gtRezXaNFlOkKD1SXQrJcINvMgsXgCwe-r"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                        <p className="text-xs text-on-surface-variant">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-[#fff1e9] flex flex-col gap-2 p-4 hidden md:flex">
        <div className="px-4 py-2 mb-4">
          <div className="text-lg font-bold text-on-surface font-headline">Bloomme Dashboard</div>
          <div className="text-xs text-on-surface-variant font-medium">Premium Floral Management</div>
        </div>

        <nav className="flex-grow space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              loyalty
            </span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/calendar">
            <span className="material-symbols-outlined">calendar_today</span>
            Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/referrals">
            <span className="material-symbols-outlined">redeem</span>
            Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/settings">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>

        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>
            Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 min-h-screen pb-12">
        {/* Hero Section */}
        <section className="px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <img
                alt="Bloomme Logo"
                className="w-auto self-start h-32"
                src="/images/backgroundlesslogo.png"
              />
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-on-surface leading-none">
                Spread the <span className="font-editorial italic text-primary">Beauty</span>,
                <br />
                Earn Rewards.
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Invite your inner circle to experience the digital florist's atelier. Every successful referral brings fresh blooms to their door and credit to your account.
              </p>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">01.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Share</h3>
                  <p className="text-sm text-on-surface-variant">Send your unique code to friends and family.</p>
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">02.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Sign Up</h3>
                  <p className="text-sm text-on-surface-variant">They get ₹50 off their first arrangement.</p>
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-editorial italic text-2xl">03.</span>
                  <h3 className="font-bold uppercase text-[12px] tracking-widest">Earn ₹50</h3>
                  <p className="text-sm text-on-surface-variant">Receive credit in your Atelier wallet instantly.</p>
                </div>
              </div>
            </div>

            {/* Referral Card */}
            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-lg border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-on-surface">Your Invitation Link</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Exclusive Atelier Access</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/20">
                      <div className="w-40 h-40 bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-6xl">qr_code_2</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Box */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center block">
                      Referral Code
                    </label>
                    <div className="flex bg-surface-container-low rounded-xl p-2 border border-outline-variant/30">
                      <div className="flex-1 flex items-center justify-center font-bold text-2xl tracking-widest text-on-surface">
                        {referralCode}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        <span className="font-bold text-xs uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="flex justify-center gap-4">
                    <button className="h-12 w-12 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-all">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">chat</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">groups</span>
                    </button>
                    <button className="h-12 w-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined">alternate_email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Total Earnings */}
            <div className="bg-surface-container-high/40 rounded-3xl p-8 border border-outline-variant/20">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Earnings</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-on-surface">₹{totalEarnings}.00</span>
                <span className="text-sm text-secondary font-bold mb-1">+₹{pendingCredit} pending</span>
              </div>
            </div>

            {/* Active Referrals */}
            <div className="bg-surface-container-high/40 rounded-3xl p-8 border border-outline-variant/20">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Successful Invites</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-on-surface">{String(successfulReferrals).padStart(2, "0")}</span>
                <span className="text-sm text-on-surface-variant mb-1">Friends</span>
              </div>
            </div>

            {/* Next Tier */}
            <div className="bg-primary-container/20 rounded-3xl p-8 border border-primary/10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Next Tier Goal</p>
              <div className="w-full bg-surface-container-highest rounded-full h-2 mb-3 overflow-hidden">
                <div className="bg-primary h-full w-[70%]"></div>
              </div>
              <p className="text-xs text-on-surface-variant">
                Invite 1 more friend for a <strong>Free Midnight Lily</strong> bouquet
              </p>
            </div>
          </div>

          {/* Referral Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-on-surface">Referred Friends</h2>
              <button className="text-sm font-bold text-primary underline decoration-2 underline-offset-4 hover:text-secondary transition-colors">
                Download Report
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl bg-surface-container-lowest border border-outline-variant/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">User</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date Joined</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reward Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Credit Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-sm">
                            {referral.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{referral.name}</p>
                            <p className="text-xs text-on-surface-variant">{referral.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface-variant">{referral.dateJoined}</td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            referral.status === "credited"
                              ? "bg-green-100 text-green-700"
                              : "bg-surface-container-highest text-primary"
                          }`}
                        >
                          {referral.status === "credited" ? "Credited" : "Pending"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-on-surface">
                        ₹{referral.creditEarned.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="md:ml-64 bg-[#fff1e9] w-full py-16 px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-on-surface-variant text-center">© 2026 blomme Crafted for devotion</p>
        </div>
      </footer>
    </div>
  );
}

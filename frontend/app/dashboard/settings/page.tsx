"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartUI } from "@/context/CartUIContext";
import { useCart } from "@/context/CartContext";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

function ChangePasswordButton({ email }: { email?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

  const handleClick = async () => {
    if (!email || state !== "idle") return;
    setState("loading");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setState("sent");
    }
  };

  if (state === "sent") return <span className="text-sm text-primary font-semibold">Check your email</span>;

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="text-primary font-bold text-sm hover:underline disabled:opacity-50"
    >
      {state === "loading" ? "Sending…" : "Change"}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Address state
  const [address, setAddress] = useState<any>(null);
  const [addrForm, setAddrForm] = useState({
    id: "", fullName: "", phone: "", houseNumber: "", street: "", area: "", city: "", pinCode: "", instructions: ""
  });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState("");

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsCartOpen } = useCartUI();
  const { cart } = useCart();
  const cartCount = cart.addons.reduce((s, a) => s + a.quantity, 0) + (cart.planId ? 1 : 0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/login"); return; }
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchSettings(token);
    } catch { router.push("/login"); }
  }, []);

  const fetchSettings = async (token: string) => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.user?.name || "");
        setProfilePhone(data.user?.phone || "");
        if (data.user?.notifications) {
          setEmailNotif(data.user.notifications.email ?? true);
          setSmsNotif(data.user.notifications.sms ?? false);
          setPushNotif(data.user.notifications.push ?? true);
        }
        if (data.address) {
          setAddress(data.address);
          setAddrForm({ ...data.address, id: data.address.id || "" });
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/user/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg("Profile saved.");
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          localStorage.setItem("user", JSON.stringify({ ...u, name: profileName }));
          setUser((prev) => prev ? { ...prev, name: profileName } : prev);
        }
      } else {
        setProfileMsg(data.error || "Failed to save.");
      }
    } catch { setProfileMsg("Network error."); }
    finally { setProfileSaving(false); }
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setAddrSaving(true);
    setAddrMsg("");
    try {
      const res = await fetch("/api/user/address/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAddrMsg("Address saved.");
        setAddrForm((prev) => ({ ...prev, id: data.addressId || prev.id }));
      } else {
        setAddrMsg(data.error || "Failed to save.");
      }
    } catch { setAddrMsg("Network error."); }
    finally { setAddrSaving(false); }
  };

  const handleSaveNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifSaving(true);
    setNotifMsg("");
    try {
      const res = await fetch("/api/user/notifications/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: emailNotif, sms: smsNotif, push: pushNotif }),
      });
      const data = await res.json();
      setNotifMsg(res.ok ? "Preferences saved." : data.error || "Failed to save.");
    } catch { setNotifMsg("Network error."); }
    finally { setNotifSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This will permanently delete your account and all data.")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    } catch { console.error("Failed to delete account"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#fff8f5]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <img alt="Bloomme Logo" className="h-12 w-auto object-contain" src="/images/backgroundlesslogo.png" />
          </Link>
          {/* Mobile hamburger - second from left */}
          <div className="relative md:hidden">
            <button
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowProfile(false); }}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
            {mobileMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 py-2 z-50">
                <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">dashboard</span>Dashboard
                </a>
                <a href="/dashboard/subscriptions" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">loyalty</span>Subscriptions
                </a>
                <a href="/dashboard/add-ons" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">featured_video</span>Add-ons
                </a>
                <a href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">calendar_today</span>Calendar
                </a>
                <a href="/dashboard/referrals" className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-base">redeem</span>Referrals
                </a>
                <a href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary bg-primary/5">
                  <span className="material-symbols-outlined text-base">settings</span>Settings
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">Dashboard</Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">Settings</a>
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/contact">Support</Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                onClick={() => { setShowNotifications(!showNotifications); }}>notifications</span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-4 z-50">
                  <p className="text-sm text-on-surface-variant text-center py-8">No notifications</p>
                </div>
              )}
            </div>
            <button
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => { setIsCartOpen(true); setShowNotifications(false); }}
              aria-label="Shopping cart"
            >
              <span className="material-symbols-outlined">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setMobileMenuOpen(false); }}>
                <span className="text-white text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/10 p-3 z-50">
                  <p className="text-sm font-medium text-on-surface mb-3">{user?.name}</p>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>Sign Out
                  </button>
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/subscriptions">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/calendar">
            <span className="material-symbols-outlined">calendar_today</span>Calendar
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/referrals">
            <span className="material-symbols-outlined">redeem</span>Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium" href="#">
            <span className="material-symbols-outlined">settings</span>Settings
          </a>
        </nav>
        <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-outline-variant/10">
          <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium text-sm hover:text-primary transition-all">
            <span className="material-symbols-outlined">logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-8 pb-12 min-h-screen">
        <header className="mb-12">
          <span className="font-editorial italic text-xl text-primary mb-2 block">Account Atelier</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">Settings</h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-outline-variant/20 overflow-x-auto pb-4">
          {["profile", "address", "notifications", "security", "danger"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 font-semibold text-sm transition-colors ${
                activeTab === tab ? "text-primary border-b-2 border-primary"
                : tab === "danger" ? "text-error hover:text-error/80"
                : "text-on-surface-variant hover:text-primary"
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {settingsLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-on-surface-variant">Loading settings...</div>
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                      {profileName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{profileName || user.name}</h3>
                      <p className="text-on-surface-variant text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                      <input className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant transition-all font-medium text-on-surface focus:outline-none focus:border-primary"
                        type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Phone Number</label>
                      <input className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant transition-all font-medium text-on-surface focus:outline-none focus:border-primary"
                        type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                      <input className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant/40 font-medium text-on-surface/60 cursor-not-allowed"
                        type="email" value={user.email} disabled />
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button onClick={handleSaveProfile} disabled={profileSaving}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                      {profileSaving ? "Saving..." : "Save Profile"}
                    </button>
                    {profileMsg && <p className="text-sm text-on-surface-variant">{profileMsg}</p>}
                  </div>
                </section>

                <aside className="lg:col-span-4 space-y-8">
                  <div className="bg-surface-container-highest rounded-xl p-6 space-y-4">
                    <h4 className="font-bold text-on-surface">Need help?</h4>
                    <p className="text-sm text-on-surface-variant">Our concierge is available for floral advice and account support.</p>
                    <Link href="/contact" className="w-full py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all active:scale-95 block text-center">
                      Contact Support
                    </Link>
                  </div>
                </aside>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <section className="max-w-2xl space-y-6">
                <h3 className="text-xl font-bold">Delivery Address</h3>
                <div className="bg-surface-container-low rounded-xl p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="Full name" value={addrForm.fullName}
                        onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Phone</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="tel" placeholder="Phone number" value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">House / Flat No.</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="House / Flat number" value={addrForm.houseNumber}
                        onChange={(e) => setAddrForm({ ...addrForm, houseNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Street</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="Street name" value={addrForm.street}
                        onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Area</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="Area / Locality" value={addrForm.area}
                        onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">City</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="City" value={addrForm.city}
                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">PIN Code</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="PIN code" value={addrForm.pinCode}
                        onChange={(e) => setAddrForm({ ...addrForm, pinCode: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Delivery Instructions</label>
                      <input className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all focus:outline-none"
                        type="text" placeholder="E.g. Ring bell twice" value={addrForm.instructions}
                        onChange={(e) => setAddrForm({ ...addrForm, instructions: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={handleSaveAddress} disabled={addrSaving}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                      {addrSaving ? "Saving..." : "Save Address"}
                    </button>
                    {addrMsg && <p className="text-sm text-on-surface-variant">{addrMsg}</p>}
                  </div>
                </div>
              </section>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <section className="max-w-xl space-y-6">
                <div className="bg-surface-container-low rounded-xl p-8">
                  <h3 className="text-xl font-bold mb-6">Communication Preferences</h3>
                  <div className="space-y-6">
                    {[
                      { label: "Email Digest", desc: "Weekly floral trends", icon: "mail", value: emailNotif, set: setEmailNotif },
                      { label: "SMS Alerts", desc: "Delivery tracking", icon: "sms", value: smsNotif, set: setSmsNotif },
                      { label: "Push Notifications", desc: "App updates & offers", icon: "notifications", value: pushNotif, set: setPushNotif },
                    ].map(({ label, desc, icon, value, set }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <div>
                            <p className="font-bold text-sm">{label}</p>
                            <p className="text-xs text-on-surface-variant">{desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input checked={value} onChange={(e) => set(e.target.checked)} className="sr-only peer" type="checkbox" />
                          <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <button onClick={handleSaveNotifications} disabled={notifSaving}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                      {notifSaving ? "Saving..." : "Save Preferences"}
                    </button>
                    {notifMsg && <p className="text-sm text-on-surface-variant">{notifMsg}</p>}
                  </div>
                </div>
              </section>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <section className="bg-surface-container-low rounded-xl p-8 max-w-2xl">
                <h3 className="text-xl font-bold mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="pb-6 border-b border-outline-variant/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Password</p>
                        <p className="text-sm text-on-surface-variant">Change your account password</p>
                      </div>
                      <ChangePasswordButton email={user?.email} />
                    </div>
                  </div>
                  <div className="pb-6 border-b border-outline-variant/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Two-Factor Authentication</p>
                        <p className="text-sm text-on-surface-variant">Add an extra layer of security</p>
                      </div>
                      <button className="text-primary font-bold text-sm hover:underline">Enable</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <section className="bg-surface-container-low rounded-xl p-8 border-l-4 border-error max-w-2xl">
                <h3 className="text-xl font-bold text-error mb-4">Danger Zone</h3>
                <p className="text-sm text-on-surface-variant mb-6">Proceed with caution. These actions are permanent and cannot be reversed.</p>
                <div className="space-y-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full text-left px-4 py-3 bg-white border border-error/20 rounded-lg text-error text-sm font-bold hover:bg-error/5 transition-colors">
                    Delete Account & All Data
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="w-full py-8 mt-auto bg-surface border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 opacity-60 max-w-[1440px] mx-auto space-y-4 md:space-y-0">
          <p className="text-xs leading-relaxed text-on-surface-variant">© 2026 Bloomme · Crafted for devotion</p>
          <div className="flex gap-8">
            <Link className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all" href="/privacy">Privacy Policy</Link>
            <Link className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all" href="/terms">Terms of Service</Link>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all" href="mailto:info@bloomme.co.in">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

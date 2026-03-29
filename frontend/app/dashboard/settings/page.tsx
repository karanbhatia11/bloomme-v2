"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "The Glass Studio",
      street: "742 Editorial Way, Suite 405",
      city: "New York",
      state: "NY",
      zip: "10012",
      isDefault: true,
    },
    {
      id: "2",
      name: "Sacred Sanctuary",
      street: "321 Bloom Avenue, Unit 102",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      isDefault: false,
    },
    {
      id: "3",
      name: "Floral Haven",
      street: "987 Petals Lane",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      isDefault: false,
    },
  ]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token && !userStr) {
      const demoUser = {
        id: "1",
        name: "Demo",
        email: "demo@bloomme.com",
      };
      localStorage.setItem("token", "demo_token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.street && newAddress.city) {
      const address: Address = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, address]);
      setNewAddress({ name: "", street: "", city: "", state: "", zip: "" });
      setShowAddForm(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    const filteredAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(filteredAddresses);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  if (!user) {
    return null;
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
              src="https://lh3.googleusercontent.com/aida/ADBb0uh7ZKyDJvwqw8ovYvtb0IHQdG6Jv2KaAOnHu1AGUxaY7f5yWx8Bm8bW4DdhajWiRGZI7aDPD80yHUQvArr709jqO0Rind89sxZ8IGlrzj_y9d76cmJXkujDpYGK96y1vFLGvzNj-84QvcdHvqUDZ0V9CeBkTJn-SpYg1fdwMw49RF6jD4a2hqRJw8d1kv9dDTXF8PRjNUwzz12qcm7zXkim20_naL4SjhWp0jH2caARUwlDppLyhWakTC5HuWY9y3cjlT0VSdPZjp8"
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <Link className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <a className="text-[#C4A052] font-bold border-b-2 border-[#C4A052]" href="#">
              Settings
            </a>
            <a className="text-on-surface-variant font-semibold tracking-tight hover:text-[#C4A052] transition-colors" href="#">
              Support
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              notifications
            </span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              shopping_cart
            </span>
            <div className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden">
              <img
                alt="User profile avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZGCW-2Yg-NfYjvjLMP5mjP8d1L0cygpIsoBCu_DLMevAPbeW6H-8_HIlvhViti-HMJICGXqq7FpY6YqmE2peGWZlqDr7Iirxtncmch1qEfWH_vLzdiOF1Luh1Oq8VDCwXD6GtPinM7VGqYjiq1HffL5N7vBJE_vxr2Xy1cZMqgaFj_5ZvqeEECObl0iBkzpNfMFjad91kXlqPIT_djKcN8y9MwSQ8KgXDQcN_UYeXU9gtRezXaNFlOkKD1SXQrJcINvMgsXgCwe-r"
              />
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">local_shipping</span>
            Orders
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
            <span className="material-symbols-outlined">redeem</span>
            Referrals
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="#">
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
      <main className="md:ml-64 pt-24 px-8 pb-12 min-h-screen">
        {/* Header */}
        <header className="mb-12">
          <span className="font-editorial italic text-xl text-primary mb-2 block">Account Atelier</span>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">Settings</h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-outline-variant/20 overflow-x-auto pb-4">
          {["profile", "address", "preferences", "notifications", "security", "danger"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 font-semibold text-sm transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : tab === "danger"
                  ? "text-error hover:text-error/80"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
              <div className="flex items-center gap-6 mb-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container p-1 bg-white">
                    <img
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZgyEWmvi968CcGfhcp3bgaMkZUFxEY3Rot3Am446JXK9dAt5ovR2Rdz8aQl1q2ggX1F5AYPbHB7Y-6ZU25O44SB_uOwsZ1ZI820ginoDpesBCN0LUszCi7k1nlM0b3mOaugisIubGt1zEyeBUbW7c-yrEUtEDLrTG5j2tlI7zmvjOjxa0Wh7tz2pICHRM-7GGsk_hjsur-g5FRa8OdjtoBHq6M0vj-IwadRdL5SFmWKq0hQTsPFP-amtzLgyUNED8pRiftfyGXlO8"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Evelyn Rosewood</h3>
                  <p className="text-on-surface-variant text-sm">Master Florist & Curator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                  <input
                    className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant transition-all font-medium text-on-surface"
                    type="text"
                    defaultValue="Evelyn Rosewood"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Phone Number</label>
                  <input
                    className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant transition-all font-medium text-on-surface"
                    type="tel"
                    defaultValue="+1 (555) 892-4410"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                  <input
                    className="w-full bg-surface-container px-0 py-3 border-0 border-b-2 border-outline-variant transition-all font-medium text-on-surface"
                    type="email"
                    defaultValue="demo@bloomme.com"
                  />
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6 flex flex-col justify-between h-48 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-primary font-bold text-lg">Bloom Loyalty</h4>
                  <p className="text-on-surface-variant text-sm mt-1">Tier: Golden Peony</p>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">2,450</span>
                  <span className="text-xs text-on-surface-variant">Petals</span>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <span className="material-symbols-outlined text-[120px]">local_florist</span>
                </div>
              </div>

              <div className="bg-surface-container-highest rounded-xl p-6 space-y-4">
                <h4 className="font-bold text-on-surface">Need help?</h4>
                <p className="text-sm text-on-surface-variant">Our concierge is available for floral advice and account support.</p>
                <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all active:scale-95">
                  Chat with Atelier
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <section className="space-y-8">
            {/* Existing Addresses */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Your Delivery Addresses</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Address
                </button>
              </div>

              {addresses.map((address) => (
                <div key={address.id} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold">{address.name}</h4>
                      {address.isDefault && (
                        <span className="text-xs font-bold px-2 py-1 bg-primary-container/20 text-primary rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant">{address.street}</p>
                    <p className="text-on-surface-variant text-sm">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>

                  <div className="flex gap-3 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="px-3 py-2 text-sm font-semibold text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            {showAddForm && (
              <div className="bg-surface-container-low rounded-xl p-8 space-y-6">
                <h3 className="text-xl font-bold">Add New Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Address Name (e.g., Home, Office)"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="md:col-span-2 w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="md:col-span-2 w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newAddress.zip}
                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                    className="w-full bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-lg focus:border-primary transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddAddress}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 bg-surface-container border border-outline-variant/20 rounded-lg font-bold hover:bg-surface-container-high transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <section className="bg-surface-container-low rounded-xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20">
                <div>
                  <p className="font-bold">Flower Preferences</p>
                  <p className="text-sm text-on-surface-variant">Select your favorite flower types for recommendations</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Seasonal Rotation</p>
                  <p className="text-sm text-on-surface-variant">Automatically include seasonal flowers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input checked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-primary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container-low rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Communication</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Email Digest</p>
                      <p className="text-xs text-on-surface-variant">Weekly floral trends</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">sms</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">SMS Alerts</p>
                      <p className="text-xs text-on-surface-variant">Delivery tracking</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
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
                    <p className="text-sm text-on-surface-variant">Last changed 3 months ago</p>
                  </div>
                  <button className="text-primary font-bold text-sm hover:underline">Change</button>
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
              <button className="w-full text-left px-4 py-3 bg-white border border-error/20 rounded-lg text-error text-sm font-bold hover:bg-error/5 transition-colors">
                Deactivate Membership
              </button>
              <button className="w-full text-left px-4 py-3 bg-white border border-error/20 rounded-lg text-error text-sm font-bold hover:bg-error/5 transition-colors">
                Delete Personal Data
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-surface border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 opacity-60 max-w-[1440px] mx-auto space-y-4 md:space-y-0">
          <p className="text-xs leading-relaxed text-on-surface-variant">© 2026 blomme Crafted for devotion</p>
          <div className="flex gap-8">
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="text-xs leading-relaxed text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

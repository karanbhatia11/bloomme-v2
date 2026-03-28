"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function AddOnsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

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

  if (!user) {
    return null;
  }

  const addOnProducts = [
    {
      id: 1,
      name: "Mysore Sandalwood Incense",
      price: 45,
      description: "Hand-rolled sticks with pure essential oils for a divine aroma.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYxvA_x1cEPh5QnsitnZPQWVUcpUoFBUG_jLWtU6v1kCwvfOIivgpfeeTa4ygiqyQ3VnjTCWgcIrFGtTktuYC9_N2xBDS0v5LFtOmoHq24ogSb9j5HUvae_uY3YBdTPda9Sk0kIoTsTpsLQcbrHMBybAOV2Y3QOhjKDVhR0nfs7_yY0uE1E9QBnFEzFyyllTPVAZCHPdWvEgdTX-RSnbbD8gwbGe9L1k4oEhSPa9xy80PH7OZFKp2ISB_qdrTEG-YHDkwf-v9NS2xO",
      badge: "Premium",
    },
    {
      id: 2,
      name: "Traditional Akshata Rice",
      price: 25,
      description: "Organic un-broken rice grains mixed with turmeric for puja.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-iLMa6hOyLu2hexnYUYh0BU7GTF0Ds5ssFSGkMGMU9c6MCBgte2vYgI1w49mMO0-UAl-vYrSNmmCHzIh2ggPkQXcyxtO1oK1t9_QXQIFQLZewH3c5OHJXIMdrq1gfkkBrNg4lKW9uD0up3IchvwrN6cRPrYkKLYNKknfiu2uW4ceZ1hdWUfFtrUgtk4BTiouZqeD-S1JWFDAVnOJTPZdZMM7v1GxztAXfY1NqgWJ9KHhMQfmgiqR3g8T0TtqgbeDEcOchcv8YIl3k",
      badge: null,
    },
    {
      id: 3,
      name: "Jasmine Night Candle",
      price: 120,
      description: "Pure soy wax candles to elevate your meditation space.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDug58sW_wAOqpKqm2b2dzoWA_Ob0aoaaoIpI_njqcFgX_L1ABgW1yw22igGKjUqeIkE-keEUg7kkJ9gCu6vLnTU0652D4GJklPBhb0i1AHGdo1FIvMYAwgxMMEuwbP1RJJr_r3poHYznnQaz2xdx8vC4oPvdrVGKcze5YJOn_F_qBQ-L75Sbpn3_wBfCatYCMLzO01a36S0AsknzzQML0b-QdmO8k_uAOKpBhkR7Hrfffh3CNQFxYTHegIcuon75-xuaz-m6pUX7hg",
      badge: null,
    },
    {
      id: 4,
      name: "Assorted Dried Petals",
      price: 15,
      description: "Sustainably dried flower petals for daily decorative rangoli.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaSVAU7nxGxeHbrZR5kiLTzPPCKXwMHVrUEpRmX7LRtZExNyazPvdQWzt4-wfbzZRPsT0j-vrMSfWU9WBHNl_bD5jUOdEAx6UKO7v4yruQDRWhc5drA-3jgsu1zsGexN_C-KMmmTbLnUWJRI24FgOz4tIb_0oSS5hcd8xsDIXVj3tyuOl2cOqMyJiWTMvlbVsGpHR8jXxPwlG0q8uOIqcZCiibbBDR3tS2wUCHlsTucF_rvuHgDhc6yHgUQDPUuw7VmrWrF6pfQLi1",
      badge: null,
    },
  ];

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
              Add-ons
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj_6SqDxnawiUNEguNe52pFHVY8Azcgb-MnmxwswOzd_ywMWT_At6qKqd9nRvhhoHD_CdhbOt-xBRK9wWcUuNhINZJ68h1n9q7g0IT9giHUJhexCTsaqYSy7cZBrj6hxTQmJDj448V9qNrNWMBlNliYCa6a4VrlCniE5imWzpSy6vfNJcv_nltz03UMKFYi2iMCH2bwtLqNuDgSMV4lUZV-UbgHyql2sTuLBY_JCW6Wh42aD0esg5zERodh8vTDCuOjX9PWuw1TG1N"
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="/dashboard/subscriptions">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              loyalty
            </span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#ffdcc3] text-on-surface rounded-lg mx-2 text-sm font-medium leading-relaxed" href="/dashboard/add-ons">
            <span className="material-symbols-outlined">featured_video</span>
            Add-ons
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
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
          <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant mx-2 text-sm font-medium leading-relaxed hover:bg-[#ffdcc3]/50 transition-all" href="#">
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
      <main className="md:ml-64 pt-24 px-8 pb-12 min-h-screen bg-gradient-to-b from-surface via-surface to-surface-container-low">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">Add-ons Management</h1>
          <p className="font-accent italic text-on-surface-variant text-lg">Curate your daily rituals with our artisanal essentials.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Current Add-ons & Browse Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Current Add-ons Section */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                  Current Ritual Add-ons
                </h2>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">2 Items Active</span>
              </div>

              <div className="flex flex-col gap-4">
                {/* Add-on Item 1 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        alt="Sacred Lotus"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvNt8GXd99qrgfuwMKEsvk6LzdYsynZhzqsQ2OhOfKUS9I2V29u7sSHqv_4Kcb0fLcNBrfoIK-JH-wV03SZJiKyOg5rxEvLY0vy-Er8MRGfBVvglPN7mWJovjait-Vqxli2iBRlS01bmbu6BE3KUK7jcK4LghiS50Ljm1xbfM2c1T7dalH5tAceZ4zL4YOytrFDTYo5wxJcJd_0X_Jpvf0xAGWy71wXmJrw9WDo1fdPjP8pPjzf3cAWiOGy5GWqfHNMPgYB9GylDrK"
                      />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">Sacred Lotus</h3>
                      <p className="text-sm text-on-surface-variant">Daily freshness, hand-picked</p>
                      <p className="text-primary font-bold mt-1">₹30/month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-surface-container-lowest rounded-full p-1 border border-outline-variant/30">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-4 font-bold text-sm">1</span>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors p-2">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Add-on Item 2 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low group hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        alt="Organic Ghee"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0-kH8FaFZqKc38yAeU8Z0L79JOJswgq8OW94pVddFyibOE4E4Bler48ikSn2W3V5wlFm7b4hugtN1gVr3k3R3BOJf1Is8InO3UtGBJ1NOflcO209TmFucbuBgf_UPCzhsGYnCPa7HEovNBIXgQpzowmHE-zMjs6PNbKwHokkuQrXBwykgyUUUp0chCCE6dxJRNzJTixvtp6vQ5nRi_XhHpvzr0TrcmPhS_3DevDB5uey4c713yicN47YktcBft41gR4FuBoD6s3Mx"
                      />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">Pure Organic Ghee</h3>
                      <p className="text-sm text-on-surface-variant">Cow ghee for traditional rituals</p>
                      <p className="text-primary font-bold mt-1">₹100/month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-surface-container-lowest rounded-full p-1 border border-outline-variant/30">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-4 font-bold text-sm">1</span>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors p-2">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Browse Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-headline font-semibold">Enhance Your Experience</h2>
                <a className="text-primary text-sm font-bold flex items-center gap-1 hover:underline" href="#">
                  View All <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addOnProducts.map((product) => (
                  <div key={product.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group">
                    <div className="h-40 overflow-hidden relative">
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                      />
                      {product.badge && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                            {product.badge}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold text-on-surface">{product.name}</h3>
                        <span className="text-primary font-bold">₹{product.price}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{product.description}</p>
                      <button className="w-full py-2 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> Add to Subscription
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Pricing Summary Card */}
            <div className="bg-on-surface text-surface rounded-xl p-8 shadow-xl sticky top-24">
              <h2 className="text-2xl font-headline font-bold mb-8">Billing Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-surface/70">
                  <span>Monthly Subscription</span>
                  <span className="font-medium">₹89</span>
                </div>
                <div className="flex justify-between items-center text-surface/70">
                  <span>Add-ons Subtotal</span>
                  <span className="font-medium">₹130</span>
                </div>
                <div className="h-px bg-surface/10 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-headline font-semibold">Next Payment</span>
                  <span className="text-2xl font-headline font-bold text-[#C4A052]">
                    ₹219<span className="text-sm font-normal text-surface/50">/month</span>
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-surface/40 pt-2">Next billing cycle: Oct 12, 2023</p>
              </div>
              <button className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-lg hover:bg-[#ffdcc3] transition-colors mb-4 flex items-center justify-center gap-2">
                Update All Selections
              </button>
              <p className="text-center text-xs text-surface/40">Changes will be reflected in your next delivery</p>
            </div>

            {/* Loyalty Chip */}
            <div className="bg-surface-container-high rounded-xl p-6 border-l-4 border-secondary">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stars
                </span>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Sacred Traditions Tier</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    You've reached the Gold Tier. Enjoy 10% off on all specialty floral add-ons this month.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Readiness */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 mb-4">Delivery Readiness</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Add-on Preparation</span>
                <span className="text-sm font-bold text-emerald-600">Freshly Sourced</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

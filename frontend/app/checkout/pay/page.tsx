"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import StickyCart from "@/components/checkout/StickyCart";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import CheckoutProgressBar from "@/components/checkout/CheckoutProgressBar";


// ── Preview types ─────────────────────────────────────────────────────────────

interface DeliveryItem { type: "subscription" | "addon"; id: string }
interface PreviewResponse {
  from: string;
  to: string;
  totalDates: number;
  queue: Record<string, DeliveryItem[]>;
}

// Friendly label for each item id
function itemLabel(item: DeliveryItem, addonNames: Record<string, string>): string {
  if (item.type === "subscription") return "Flowers";
  return addonNames[item.id] ?? `Add-on #${item.id}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CheckoutPayPage() {
  const router = useRouter();
  const { cart, getTotal, clearCart, buildAddonPayload } = useCart();

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [preview, setPreview]           = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [isCartOpen, setIsCartOpen]     = useState(false);

  // Build addon name lookup (id → title) for the preview display
  const addonNames: Record<string, string> = {};
  for (const a of cart.addons) {
    addonNames[String(a.id)] = a.title;
  }

  // ── Fetch delivery preview on mount ────────────────────────────────────────
  const fetchPreview = useCallback(async () => {
    // Need either a subscription or addons to show preview
    if (!cart.planId && cart.addons.length === 0) return;

    setPreviewLoading(true);
    setPreviewError("");

    // Determine start date: use subscription start date, or today for addon-only
    const from = cart.startDate || new Date().toISOString().slice(0, 10);
    const to = (() => {
      const d = new Date(from + "T00:00:00");
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    })();

    try {
      let subscriptionObj: any = null;

      if (cart.planId) {
        subscriptionObj = {
          id: "preview",
          startDate: from,
          frequency: cart.frequency,
        };

        if (cart.frequency === "weekly") {
          subscriptionObj.deliveryDays = cart.deliveryDays;
        } else if (cart.frequency === "custom" && cart.customDates) {
          subscriptionObj.customDates = cart.customDates;
        }

        if (cart.deselectedDates && cart.deselectedDates.length > 0) {
          subscriptionObj.skipDates = cart.deselectedDates;
        }
      }

      const body = {
        subscription: subscriptionObj,
        addons: buildAddonPayload(),
        from,
        to,
      };

      const res = await fetch("/api/preview/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Preview unavailable");
      const data: PreviewResponse = await res.json();
      setPreview(data);
    } catch (err: any) {
      setPreviewError(err.message ?? "Could not load delivery preview.");
    } finally {
      setPreviewLoading(false);
    }
  }, [cart, buildAddonPayload]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // ── Subscribe → store subscription + trigger scheduler ───────────────────
  const createSubscription = async (): Promise<void> => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return; // gracefully skip if not authenticated

    // Skip if no plan (addon-only)
    if (!cart.planId) return;

    const addonApiItems = buildAddonPayload();

    const addon_configs = addonApiItems.map((item) => ({
      add_on_id:             parseInt(item.id, 10),
      addon_type:            item.type,
      addon_frequency:       item.frequency ?? null,
      addon_delivery_days:   item.deliveryDays ?? null,
      addon_custom_dates:    item.customDates ?? null,
      addon_start_date:      item.startDate ?? null,
    }));

    // Extract delivery dates from preview for custom_schedule
    let custom_schedule: string[] | null = null;
    if (preview && cart.planId) {
      const datesWithSubscription = Object.entries(preview.queue)
        .filter(([_, items]) => items.some(item => item.type === "subscription"))
        .map(([date]) => date)
        .sort();
      if (datesWithSubscription.length > 0) {
        custom_schedule = datesWithSubscription;
      }
    }

    try {
      const res = await fetch("/api/subs/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id:       cart.planId === "TRADITIONAL" ? 1 : cart.planId === "DIVINE" ? 2 : cart.planId === "CELESTIAL" ? 3 : null,
          price:         cart.planPrice,
          frequency:     cart.frequency,
          start_date:    cart.startDate,
          delivery_days: cart.frequency === "weekly" ? cart.deliveryDays : [],
          custom_schedule: custom_schedule,
          addon_configs: addon_configs.length > 0 ? addon_configs : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Subscription creation failed:", err);
      }
    } catch (err) {
      console.error("Subscription creation error:", err);
    }
  };

  // ── Dev test payment (skip Razorpay, guest or authenticated) ─────────────
  const handleDevPay = async () => {
    setLoading(true);
    setError("");

    try {
      console.log('Dev payment initiated. preview:', !!preview, 'cart.planId:', cart.planId);

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // Map plan type string to a numeric plan ID for testing
      const planIdMap: Record<string, number> = {
        "TRADITIONAL": 1,
        "DIVINE": 2,
        "CELESTIAL": 3,
      };

      // Step 1: Create order (works for both guest and authenticated users)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Extract delivery dates from preview for dev payment
      let customScheduleForDev: string[] = [];
      if (preview && cart.planId) {
        const datesWithSubscription = Object.entries(preview.queue)
          .filter(([_, items]) => items.some(item => item.type === "subscription"))
          .map(([date]) => date)
          .sort();
        customScheduleForDev = datesWithSubscription;
        console.log('customScheduleForDev extracted:', customScheduleForDev);
      } else {
        console.log('Skipping schedule extraction: preview=', preview, 'planId=', cart.planId);
      }

      const createOrderRes = await fetch("/api/payments/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          planId: cart.planId ? planIdMap[cart.planId] || null : null,
          deliveryDays: cart.frequency === "weekly" ? cart.deliveryDays : [],
          addOns: cart.addons.map(a => {
            const sched = cart.addonSchedules[a.id] ?? { mode: "same" };
            let multiplier = 1;
            if (sched.mode === "same") {
              multiplier = cart.selectedDeliveryDatesCount || 1;
            } else if (sched.mode === "different" && sched.customDates) {
              multiplier = sched.customDates.length || 1;
            }
            return {
              id: a.id,
              quantity: a.quantity,
              price: a.price * a.quantity * multiplier,
              schedule: cart.addonSchedules[a.id] || null,
            };
          }),
          promoCode: null,
          referralCode: null,
          customer: cart.customer,
          subtotal: cart.planPrice || 0,
          tax: 0,
          promoDiscount: 0,
          referralDiscount: 0,
          total: getTotal(),
          customSchedule: customScheduleForDev.length > 0 ? customScheduleForDev : null,
        }),
      });

      if (!createOrderRes.ok) {
        const errData = await createOrderRes.json().catch(() => ({}));
        setError(errData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrderId } = await createOrderRes.json();

      // Step 2: Verify with dev data
      const verifyHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        verifyHeaders["Authorization"] = `Bearer ${token}`;
      }

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: verifyHeaders,
        body: JSON.stringify({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `dev_payment_${Date.now()}`,
          razorpaySignature: "dev_signature",
          customer: cart.customer, // Add guest customer info
        }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        // Only create subscription for logged-in users
        // Guests will create account after payment
        if (!verifyData.isGuest) {
          await createSubscription();
        }
        clearCart();
        router.push("/checkout/confirmed");
      } else {
        const errData = await verifyRes.json();
        setError(errData.error || "Dev payment verification failed.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay payment handler ───────────────────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // Map plan type string to a numeric plan ID
      const planIdMap: Record<string, number> = {
        "TRADITIONAL": 1,
        "DIVINE": 2,
        "CELESTIAL": 3,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Extract delivery dates from preview if available
      let customSchedule: string[] = [];
      if (preview && cart.planId) {
        const datesWithSubscription = Object.entries(preview.queue)
          .filter(([_, items]) => items.some(item => item.type === "subscription"))
          .map(([date]) => date)
          .sort();
        customSchedule = datesWithSubscription;
        console.log('customSchedule extracted:', customSchedule, 'type:', typeof customSchedule, 'isArray:', Array.isArray(customSchedule));
      }

      const orderRes = await fetch("/api/payments/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          planId: cart.planId ? planIdMap[cart.planId] || null : null,
          deliveryDays: cart.frequency === "weekly" ? cart.deliveryDays : [],
          addOns: cart.addons.map(a => {
            const sched = cart.addonSchedules[a.id] ?? { mode: "same" };
            let multiplier = 1;
            if (sched.mode === "same") {
              multiplier = cart.selectedDeliveryDatesCount || 1;
            } else if (sched.mode === "different" && sched.customDates) {
              multiplier = sched.customDates.length || 1;
            }
            return {
              id: a.id,
              quantity: a.quantity,
              price: a.price * a.quantity * multiplier,
              schedule: cart.addonSchedules[a.id] || null,
            };
          }),
          promoCode: null,
          referralCode: null,
          customer: cart.customer,
          subtotal: cart.planPrice || 0,
          tax: 0,
          promoDiscount: 0,
          referralDiscount: 0,
          total: getTotal(),
          customSchedule: customSchedule.length > 0 ? customSchedule : null,
        }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");
      const { orderId, razorpayOrderId, amount, currency } = await orderRes.json();

      // Get Razorpay key from environment (this should be set in your NEXT_PUBLIC_ env var)
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment.');
      }

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Razorpay script failed to load"));
          document.body.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay({
        key: razorpayKey,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "Bloomme",
        description: `${cart.planName || "Add-ons"} Order`,
        image: `${typeof window !== 'undefined' ? window.location.origin : ''}/images/backgroundlesslogo.png`,
        prefill: {
          name:    cart.customer?.name || "",
          email:   cart.customer?.email || "",
          contact: cart.customer?.phone ? `+91${cart.customer.phone}` : "",
        },
        theme: { color: "#775a11" },
        handler: async (response: any) => {
          try {
            const verifyHeaders: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (token) {
              verifyHeaders["Authorization"] = `Bearer ${token}`;
            }

            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: verifyHeaders,
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              // Payment verified — create subscription for logged-in users
              // Guests will create account after payment
              if (!verifyData.isGuest) {
                await createSubscription();
              }
              clearCart();
              router.push("/checkout/confirmed");
            } else {
              const errData = await verifyRes.json();
              setError(errData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            setError(err.message || "Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      // Add error handler
      rzp.on('payment.failed', function(response: any) {
        setError(`Payment failed: ${response.error.reason || 'Unknown error'}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const total = getTotal();

  // Check for addons that are set to "same_as_subscription" but no subscription exists
  const addonsNeedingDates = cart.addons.filter((addon) => {
    const sched = cart.addonSchedules[addon.id];
    // If no schedule OR schedule is in "same" mode, but no plan exists
    return (!sched || sched.mode === "same") && !cart.planId;
  });

  const hasInvalidAddons = addonsNeedingDates.length > 0;

  return (
    <div className="min-h-screen pb-40 bg-[#fff8f5]" style={{ color: "#2f1500", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <CheckoutHeader
        isCartOpen={isCartOpen}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
      />
      <StickyCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <main className="max-w-2xl mx-auto px-6 pt-12">

        <CheckoutProgressBar currentStep={5} />

        {/* Title */}
        <div className="mb-10 space-y-2">
          <h2 className="text-4xl font-bold text-[#2f1500] tracking-tighter">Review & Pay</h2>
          <p className="font-['Playfair_Display'] italic text-[#775a11]">
            Almost there — confirm your order below.
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-[#fff1e9] rounded-3xl p-8 mb-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60">Order Summary</h3>

          {cart.planName && (
            <div className="flex items-center justify-between py-3 border-b border-[#d1c5b3]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#775a11] text-sm">local_florist</span>
                </div>
                <div>
                  <p className="font-semibold text-[#2f1500] text-sm">{cart.planName} Plan - {cart.selectedDeliveryDatesCount || 0} deliveries</p>
                  <p className="text-[#4d4638]/60 text-xs">
                    {cart.frequency === "daily" ? "Daily" : cart.frequency === "alternate" ? "Alternate days" : `${cart.deliveryDays.length} days/week`}
                    {cart.startDate && preview ? (() => {
                      const datesWithSubscription = Object.entries(preview.queue)
                        .filter(([_, items]) => items.some(item => item.type === "subscription"))
                        .map(([date]) => date)
                        .sort();
                      const lastDate = datesWithSubscription[datesWithSubscription.length - 1];
                      const endDateStr = lastDate ? new Date(lastDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
                      return ` · from ${new Date(cart.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} to ${endDateStr}`;
                    })() : cart.startDate ? ` · from ${new Date(cart.startDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                  </p>
                </div>
              </div>
              <p className="font-bold text-[#2f1500]">₹{cart.adjustedPrice || cart.planPrice}</p>
            </div>
          )}

          {cart.addons.map((addon) => {
            const sched = cart.addonSchedules[addon.id];
            const needsDateSelection = (!sched || sched.mode === "same") && !cart.planId;

            const schedLabel = !sched || sched.mode === "same"
              ? "Same as subscription"
              : sched.frequency === "daily" ? "Daily"
              : sched.frequency === "alternate" ? "Alternate"
              : "Custom schedule";

            // Calculate number of deliveries for this addon
            let deliveryCount = 1;
            if (!sched || sched.mode === "same") {
              deliveryCount = cart.selectedDeliveryDatesCount || 1;
            } else if (sched.mode === "different" && sched.customDates) {
              deliveryCount = sched.customDates.length || 1;
            }

            return (
              <div key={addon.id} className="py-3 border-b border-[#d1c5b3]/20 last:border-0">
                {needsDateSelection && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                    <span className="text-xs text-red-700 font-medium">Please select delivery dates for {addon.title}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${needsDateSelection ? "bg-red-100" : "bg-[#ffdcc3]/60"}`}>
                      <span className={`material-symbols-outlined text-sm ${needsDateSelection ? "text-red-600" : "text-[#775a11]"}`}>redeem</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2f1500] text-sm">{addon.title} - {deliveryCount} deliveries</p>
                      <p className={`text-xs ${needsDateSelection ? "text-red-600 font-semibold" : "text-[#4d4638]/60"}`}>Qty {addon.quantity} · {needsDateSelection ? "Dates required" : schedLabel}</p>
                      {sched?.mode === "different" && sched?.customDates && sched.customDates.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#d1c5b3]/20">
                          <p className="text-[10px] font-semibold text-[#775a11] uppercase tracking-widest mb-1">Selected Dates:</p>
                          <div className="flex flex-wrap gap-1">
                            {sched.customDates.slice(0, 5).map((date) => (
                              <span key={date} className="text-[10px] bg-[#ffdcc3]/40 text-[#775a11] px-2 py-1 rounded">
                                {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            ))}
                            {sched.customDates.length > 5 && (
                              <span className="text-[10px] text-[#4d4638]/60 px-2 py-1">+{sched.customDates.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-[#2f1500] flex-shrink-0">₹{addon.price * addon.quantity * deliveryCount}</p>
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t-2 border-[#d1c5b3]/30 flex items-center justify-between">
            <p className="font-bold text-[#2f1500]">Total</p>
            <p className="text-2xl font-extrabold text-[#2f1500]">₹{total}.00</p>
          </div>
        </div>

        {/* Delivery Preview */}
        <div className="bg-[#fff1e9] rounded-3xl p-8 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60">Delivery Preview</h3>
            {preview && (
              <span className="text-xs text-[#775a11] font-semibold">
                {preview.totalDates} days in 30-day window
              </span>
            )}
          </div>

          {previewLoading && (
            <div className="flex items-center gap-3 py-4">
              <span className="w-5 h-5 rounded-full border-2 border-[#d1c5b3] border-t-[#775a11] animate-spin" />
              <span className="text-sm text-[#4d4638]/60">Loading delivery schedule…</span>
            </div>
          )}

          {previewError && (
            <div className="flex items-center gap-3 py-2 text-sm text-[#4d4638]/60">
              <span className="material-symbols-outlined text-sm text-[#c4a052]">info</span>
              {previewError}
            </div>
          )}

          {preview && !previewLoading && (
            <div>
              {/* 30-day calendar */}
              <div className="bg-[#fafafa] rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, idx) => {
                  // Parse the start date and add idx days properly
                  // Use preview.from as the base (handles both subscription and addon-only)
                  const baseDate = preview.from || cart.startDate;
                  const date = new Date(baseDate + "T00:00:00");
                  date.setDate(date.getDate() + idx);
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  const dayNum = date.getDay();
                  const dayShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayNum];
                  const dateOfMonth = date.getDate();

                  // Get items for this date
                  const items = preview.queue[dateStr] || [];
                  const hasSubscription = items.some(item => item.type === "subscription");
                  const hasAddons = items.some(item => item.type === "addon");

                  // Highlight selected dates
                  const bgColor = items.length > 0
                    ? "bg-[#ffdcc3]/40 border-[#c4a052]"
                    : "bg-white border-[#d1c5b3]/40";

                  return (
                    <div
                      key={dateStr}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-lg border-2 text-xs transition-all ${bgColor}`}
                    >
                      <span className="text-[8px] font-bold text-[#4d4638]/70">{dayShort}</span>
                      <span className="text-xs font-bold text-[#2f1500]">{dateOfMonth}</span>

                      {/* Icons: subscription on left, addons on right */}
                      {hasSubscription && (
                        <span className="absolute top-1 left-1 material-symbols-outlined text-[#775a11] leading-none" style={{ fontSize: '16px' }}>
                          local_florist
                        </span>
                      )}
                      {hasAddons && (
                        <span className="absolute top-1 right-1 material-symbols-outlined text-[#ab3500] leading-none" style={{ fontSize: '16px' }}>
                          redeem
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>

              {/* Legend */}
              <div className="flex gap-6 text-xs mt-4 pt-4 border-t border-[#d1c5b3]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#775a11]" style={{ fontSize: '18px' }}>local_florist</span>
                  <span className="text-[#4d4638]">Subscription</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ab3500]" style={{ fontSize: '18px' }}>redeem</span>
                  <span className="text-[#4d4638]">Add-ons</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Info */}
        {cart.customer && (
          <div className="bg-[#ffdcc3]/20 rounded-3xl p-6 mb-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4d4638]/60">Delivering To</h3>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#775a11] mt-0.5 text-sm">location_on</span>
              <div>
                <p className="font-semibold text-[#2f1500]">{cart.customer.name}</p>
                <p className="text-[#4d4638] text-sm">{cart.customer.address}, {cart.customer.city}</p>
                <p className="text-[#4d4638] text-sm">+91 {cart.customer.phone}</p>
              </div>
            </div>
            <Link href="/checkout/details" className="text-xs text-[#775a11] underline underline-offset-2">
              Edit details
            </Link>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 py-4 mb-6">
          {[
            { icon: "lock",     label: "Secure Payment" },
            { icon: "verified", label: "Razorpay"        },
            { icon: "replay",   label: "Easy Cancel"     },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-[#c4a052] text-xl">{icon}</span>
              <span className="text-[10px] font-semibold text-[#4d4638]/60 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="h-24" />
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-t border-[#d1c5b3]/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdcc3] flex items-center justify-center text-[#775a11]">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d4638] tracking-widest uppercase opacity-60">Amount to Pay</p>
              <p className="text-2xl font-extrabold text-[#2f1500]">₹{total}.00</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handlePay}
              disabled={loading || hasInvalidAddons}
              title={hasInvalidAddons ? "Please select delivery dates for all add-ons" : ""}
              className="w-full md:w-auto px-12 py-5 rounded-full bg-gradient-to-r from-[#775a11] to-[#c4a052] text-white font-bold text-lg tracking-tight shadow-[0_20px_40px_rgba(47,21,0,0.06)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Pay Securely ₹{total}
                </>
              )}
            </button>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={handleDevPay}
                disabled={loading || hasInvalidAddons}
                className="w-full md:w-auto px-6 py-2 rounded-full bg-slate-600 text-white font-semibold text-sm hover:bg-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Dev: Complete
              </button>
            )}
            {hasInvalidAddons && (
              <p className="text-xs text-red-600 font-medium">
                Please select delivery dates for {addonsNeedingDates.length} add-on{addonsNeedingDates.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <StickyCart />

      <div className="fixed top-20 right-[-100px] w-64 h-64 bg-[#775a11]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-40 left-[-100px] w-80 h-80 bg-[#ab3500]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}

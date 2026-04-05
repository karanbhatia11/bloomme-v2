"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const STEPS = [
  { step: 1, label: "Plan",     href: "/checkout/plan"     },
  { step: 2, label: "Schedule", href: "/checkout/schedule" },
  { step: 3, label: "Add-ons",  href: "/checkout/addons"   },
  { step: 4, label: "Details",  href: "/checkout/details"  },
  { step: 5, label: "Pay",      href: "/checkout/pay"      },
] as const;

function useCheckoutValidation() {
  const { cart } = useCart();

  const hasValidAddonWithOwnDates = cart.addons.some((addon) => {
    const sched = cart.addonSchedules[addon.id];
    return sched?.mode === "different" && (sched.customDates?.length ?? 0) > 0;
  });

  const unlockedUpTo: Record<number, boolean> = {
    1: true,
    2: cart.planId !== "",
    3: cart.planId !== "" && cart.startDate !== "",
    4: (cart.planId !== "" && cart.startDate !== "")
       || hasValidAddonWithOwnDates,
    5: cart.customer !== null
       && !!cart.customer.name?.trim()
       && !!cart.customer.phone?.trim()
       && !!cart.customer.email?.trim()
       && !!cart.customer.address?.trim(),
  };

  const blockedMessages: Record<number, string> = {
    2: "Complete the Plan step first",
    3: "Complete the Schedule step first",
    4: "Add at least one add-on with selected dates",
    5: "Complete your Details first",
  };

  return { unlockedUpTo, blockedMessages };
}

interface CheckoutProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

export default function CheckoutProgressBar({ currentStep }: CheckoutProgressBarProps) {
  const router = useRouter();
  const { unlockedUpTo: baseUnlockedUpTo, blockedMessages } = useCheckoutValidation();

  // Step 5 requires you to have reached step 4 first
  const unlockedUpTo = {
    ...baseUnlockedUpTo,
    5: currentStep >= 4,
  };
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleStepClick = (step: number, href: string) => {
    if (step <= currentStep || unlockedUpTo[step]) {
      router.push(href);
    } else {
      setToast(blockedMessages[step] ?? "Complete the previous steps first");
    }
  };

  return (
    <>
      <div className="mb-16">
        <div className="flex items-center justify-between max-w-lg mx-auto relative">
          <div className="absolute top-5 left-0 w-full h-px bg-[#d1c5b3]/30 -z-10" />
          {STEPS.map(({ step, label, href }) => {
            const active = step === currentStep;
            const done   = step < currentStep;
            const locked = step > currentStep && !unlockedUpTo[step];

            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleStepClick(step, href)}
                  aria-label={`Go to ${label}${locked ? " (locked)" : ""}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-all
                    ${active  ? "bg-[#775a11] text-white"
                    : done    ? "bg-[#c4a052] text-white hover:opacity-80"
                    : locked  ? "bg-[#ffe3d0] text-[#4d4638]/40 cursor-not-allowed"
                              : "bg-[#ffe3d0] text-[#4d4638] hover:bg-[#ffdcc3]"}`}
                >
                  {done
                    ? <span className="material-symbols-outlined text-sm">check</span>
                    : step}
                </button>
                <span className={`text-xs font-bold tracking-widest uppercase
                  ${active ? "text-[#2f1500]" : "text-[#4d4638]/60"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-[#2f1500] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-xl pointer-events-none select-none"
        >
          {toast}
        </div>
      )}
    </>
  );
}

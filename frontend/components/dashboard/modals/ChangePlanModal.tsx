"use client";

import React, { useState, useEffect } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface ChangePlanModalProps {
  isOpen: boolean;
  subscriptionId: string;
  currentPlan: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (planType: string) => Promise<boolean>;
}

// Mapping of plan IDs to display info
const PLAN_FEATURES: Record<string, string[]> = {
  TRADITIONAL: ["Fresh weekly delivery", "3 flower varieties", "Eco-friendly packaging"],
  DIVINE: ["Weekly premium selection", "5+ flower varieties", "Bloomme signature box"],
  CELESTIAL: ["Curated exotic flowers", "Seasonal specialties", "Luxury packaging"],
};

export default function ChangePlanModal({
  isOpen,
  subscriptionId,
  currentPlan,
  isLoading = false,
  onClose,
  onSubmit,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && plans.length === 0) {
      fetchPlans();
    }
  }, [isOpen, plans.length]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subs/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    if (selectedPlan === currentPlan) {
      setError("Please select a different plan");
      return;
    }

    const success = await onSubmit(selectedPlan);
    if (success) {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  const currentPlanObj = plans.find((p) => p.id === currentPlan);
  const selectedPlanObj = plans.find((p) => p.id === selectedPlan);
  const priceDiff = selectedPlanObj
    ? selectedPlanObj.price - (currentPlanObj?.price || 0)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={handleBackdropClick} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-2xl border border-outline-variant/20 shadow-xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Choose Your Plan</h2>
          <p className="text-sm text-on-surface-variant">
            {priceDiff > 0
              ? `${priceDiff > 0 ? "+" : ""}₹${Math.abs(priceDiff)}/month difference`
              : "Select a plan"}
          </p>
        </div>

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-on-surface-variant">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                disabled={isLoading}
                className={`p-6 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/20 hover:border-primary/50"
                }`}
              >
                {plan.id === currentPlan && (
                  <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded mb-3 border border-green-200">
                    Current
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
                    <p className="text-xs text-on-surface-variant">{plan.description}</p>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-lg">
                    <p className="text-2xl font-bold text-on-surface">
                      ₹{plan.price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">/month</p>
                  </div>

                  <div className="space-y-2">
                    {(PLAN_FEATURES[plan.id] || []).map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">
                          check_circle
                        </span>
                        <span className="text-xs text-on-surface-variant">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="w-full h-1 bg-primary rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Price Comparison */}
        {priceDiff !== 0 && selectedPlan !== currentPlan && (
          <div className={`p-4 rounded-lg ${priceDiff > 0 ? "bg-blue-50" : "bg-green-50"}`}>
            <p className="text-sm font-semibold text-on-surface">
              {priceDiff > 0
                ? `Your plan will increase by ₹${priceDiff}/month.`
                : `You'll save ₹${Math.abs(priceDiff)}/month!`}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Changes take effect on your next billing cycle.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-error">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-outline-variant/30 text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedPlan === currentPlan}
            className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              `Change to ${selectedPlanObj?.name || "Plan"}`
            )}
          </button>
        </div>
      </div>
    </>
  );
}

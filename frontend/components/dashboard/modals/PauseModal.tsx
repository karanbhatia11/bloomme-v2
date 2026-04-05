"use client";

import React, { useState } from "react";

interface PauseModalProps {
  isOpen: boolean;
  subscriptionId: string;
  subscriptionStartDate?: string; // ISO date string
  subscriptionEndDate?: string;   // ISO date string
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (startDate: string, endDate: string) => Promise<boolean>;
}

export default function PauseModal({
  isOpen,
  subscriptionId,
  subscriptionStartDate,
  subscriptionEndDate,
  isLoading = false,
  onClose,
  onSubmit,
}: PauseModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }

    if (subscriptionStartDate && new Date(startDate) < new Date(subscriptionStartDate)) {
      setError(`Start date cannot be before subscription start date (${subscriptionStartDate})`);
      return;
    }

    if (subscriptionEndDate && new Date(endDate) > new Date(subscriptionEndDate)) {
      setError(`End date cannot be after subscription end date (${subscriptionEndDate})`);
      return;
    }

    const success = await onSubmit(startDate, endDate);
    if (success) {
      setStartDate("");
      setEndDate("");
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  // Min date is today or subscription start date (whichever is later)
  const today = new Date().toISOString().split("T")[0];
  const minDate = subscriptionStartDate && subscriptionStartDate > today ? subscriptionStartDate : today;

  // Max date is subscription end date, or no limit if not set
  const maxDate = subscriptionEndDate;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl border border-outline-variant/20 shadow-xl p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Pause Subscription</h2>
          <p className="text-sm text-on-surface-variant">
            Select the date range when you want to pause deliveries.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Start Date
            </label>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 bg-surface-container-low"
            />
            {subscriptionStartDate && (
              <p className="text-xs text-on-surface-variant mt-1">
                Subscription active from {new Date(subscriptionStartDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              End Date
            </label>
            <input
              type="date"
              min={startDate || minDate}
              max={maxDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-outline-variant/30 rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 bg-surface-container-low"
            />
            {subscriptionEndDate && (
              <p className="text-xs text-on-surface-variant mt-1">
                Subscription ends on {new Date(subscriptionEndDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-error">{error}</p>
            </div>
          )}
        </div>

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
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Pausing...
              </>
            ) : (
              "Pause Subscription"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

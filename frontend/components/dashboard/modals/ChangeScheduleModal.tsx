"use client";

import React, { useState } from "react";

interface ChangeScheduleModalProps {
  isOpen: boolean;
  subscriptionId: string;
  currentDays: string[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (frequency: string, deliveryDays: string[]) => Promise<boolean>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FREQUENCIES = [
  { value: "daily", label: "Every Day" },
  { value: "alternate", label: "Every Other Day" },
  { value: "weekly", label: "Weekly" },
];

export default function ChangeScheduleModal({
  isOpen,
  subscriptionId,
  currentDays,
  isLoading = false,
  onClose,
  onSubmit,
}: ChangeScheduleModalProps) {
  const [frequency, setFrequency] = useState<string>("weekly");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(() => {
    let days: string[] = [];

    if (Array.isArray(currentDays)) {
      days = currentDays;
    } else if (typeof currentDays === 'string') {
      try {
        // Try to parse as JSON array
        days = JSON.parse(currentDays);
      } catch {
        // If it's not JSON, treat it as a comma-separated string
        days = currentDays.split(',').map(d => d.trim());
      }
    }

    return new Set(days.map((d: string) => d.toLowerCase().slice(0, 3)));
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    const newDays = new Set(selectedDays);
    const dayShort = day.toLowerCase().slice(0, 3);

    if (newDays.has(dayShort)) {
      newDays.delete(dayShort);
    } else {
      newDays.add(dayShort);
    }

    setSelectedDays(newDays);
  };

  const handleSubmit = async () => {
    setError(null);

    if (selectedDays.size === 0) {
      setError("Please select at least one delivery day");
      return;
    }

    const days = Array.from(selectedDays)
      .map((d) => DAYS.find((day) => day.toLowerCase().slice(0, 3) === d) || "")
      .filter(Boolean);

    const success = await onSubmit(frequency, days);
    if (success) {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

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
          <h2 className="text-2xl font-bold text-on-surface">Change Schedule</h2>
          <p className="text-sm text-on-surface-variant">
            Update your delivery frequency and preferred days.
          </p>
        </div>

        <div className="space-y-4">
          {/* Frequency Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Delivery Frequency
            </label>
            <div className="space-y-2">
              {FREQUENCIES.map((freq) => (
                <label
                  key={freq.value}
                  className="flex items-center gap-3 p-3 border border-outline-variant/30 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq.value}
                    checked={frequency === freq.value}
                    onChange={(e) => setFrequency(e.target.value)}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <span className="font-semibold text-on-surface">{freq.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Days Selection (only for weekly/alternate) */}
          {(frequency === "weekly" || frequency === "alternate") && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                Select Days
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map((day) => {
                  const dayShort = day.toLowerCase().slice(0, 3);
                  const isSelected = selectedDays.has(dayShort);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      disabled={isLoading}
                      className={`py-2 px-1 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                        isSelected
                          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {day.slice(0, 1)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                Updating...
              </>
            ) : (
              "Update Schedule"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

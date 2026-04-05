"use client";

import React, { useState, useMemo } from "react";

interface SkipDatesModalProps {
  isOpen: boolean;
  subscriptionId: string;
  deliveryDays: string[];
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (dates: string[]) => Promise<boolean>;
}

export default function SkipDatesModal({
  isOpen,
  subscriptionId,
  deliveryDays,
  isLoading = false,
  onClose,
  onSubmit,
}: SkipDatesModalProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = useMemo(() => {
    let days: string[] = [];

    if (Array.isArray(deliveryDays)) {
      days = deliveryDays;
    } else if (typeof deliveryDays === 'string') {
      try {
        // Try to parse as JSON array
        days = JSON.parse(deliveryDays);
      } catch {
        // If it's not JSON, treat it as a comma-separated string
        days = deliveryDays.split(',').map(d => d.trim());
      }
    }

    return days.map((d: string) => d.toLowerCase().slice(0, 3));
  }, [deliveryDays]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeekName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
        date.getDay()
      ];
      const isDeliveryDay = daysOfWeek.includes(dayOfWeekName as any);
      const isPast = date < today;

      days.push({
        date: i,
        fullDate: date.toISOString().split("T")[0],
        dayOfWeek: dayOfWeekName,
        isDeliveryDay,
        isPast,
      });
    }

    return days;
  }, [currentMonth, daysOfWeek]);

  if (!isOpen) return null;

  const handleDateToggle = (fullDate: string) => {
    const newDates = new Set(selectedDates);
    if (newDates.has(fullDate)) {
      newDates.delete(fullDate);
    } else {
      newDates.add(fullDate);
    }
    setSelectedDates(newDates);
  };

  const handleSubmit = async () => {
    setError(null);

    if (selectedDates.size === 0) {
      setError("Please select at least one date to skip");
      return;
    }

    const dates = Array.from(selectedDates).sort();
    const success = await onSubmit(dates);
    if (success) {
      setSelectedDates(new Set());
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!isLoading) onClose();
  };

  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl border border-outline-variant/20 shadow-xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Skip Deliveries</h2>
          <p className="text-sm text-on-surface-variant">
            Select specific dates to skip. Only delivery days are shown.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            disabled={isLoading}
            className="p-2 hover:bg-surface-container-low rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <h3 className="text-lg font-bold text-on-surface text-center flex-1">
            {monthName}
          </h3>
          <button
            onClick={handleNextMonth}
            disabled={isLoading}
            className="p-2 hover:bg-surface-container-low rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Calendar */}
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-bold text-on-surface-variant">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) =>
              day === null ? (
                <div key={`empty-${idx}`} />
              ) : day.isPast || !day.isDeliveryDay ? (
                <div
                  key={day.fullDate}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold ${
                    !day.isDeliveryDay
                      ? "bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-50"
                      : "bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-50"
                  }`}
                >
                  {day.date}
                </div>
              ) : (
                <button
                  key={day.fullDate}
                  onClick={() => handleDateToggle(day.fullDate)}
                  disabled={isLoading}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
                    selectedDates.has(day.fullDate)
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {day.date}
                </button>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-error">{error}</p>
          </div>
        )}

        {selectedDates.size > 0 && (
          <div className="bg-primary/10 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-primary mb-2">
              {selectedDates.size} date{selectedDates.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedDates)
                .sort()
                .map((date) => (
                  <span
                    key={date}
                    className="bg-primary text-on-primary text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
                  >
                    {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                    <button
                      onClick={() => handleDateToggle(date)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
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
            disabled={isLoading || selectedDates.size === 0}
            className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Skipping...
              </>
            ) : (
              `Skip ${selectedDates.size} date${selectedDates.size !== 1 ? "s" : ""}`
            )}
          </button>
        </div>
      </div>
    </>
  );
}

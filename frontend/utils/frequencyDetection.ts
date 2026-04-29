/**
 * Advanced frequency detection with date-based alternate detection
 * Frequency is NOT manually selected - it's auto-derived from selected days
 */

type Frequency = "daily" | "alternate" | "weekends" | "weekly" | "custom";

/**
 * Detects frequency based on selected days and start date
 * Priority: Daily → Weekends → Alternate → Weekly → Custom
 */
export function detectFrequency(days: number[], startDate: string): Frequency {
  if (days.length === 0) return "custom";

  const sorted = [...days].sort((a, b) => a - b);

  // 1. Daily: all 7 days
  if (sorted.length === 7 && sorted.every((d, i) => d === i)) {
    return "daily";
  }

  // 2. Weekends: only Saturday (6) and Sunday (0)
  if (sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6) {
    return "weekends";
  }

  // 3. Alternate: Mon (1), Wed (3), Fri (5)
  if (sorted.length === 3 && sorted[0] === 1 && sorted[1] === 3 && sorted[2] === 5) {
    return "alternate";
  }

  // 4. Custom: Sat+Sun + other days (weekend-focused combos)
  if (sorted.includes(0) && sorted.includes(6) && sorted.length >= 2) {
    return "custom";
  }

  // 5. Weekly: any other consistent pattern (1-5 days, not the above)
  if (days.length > 0 && days.length <= 5) {
    return "weekly";
  }

  // 6. Custom: fallback (6 days or other patterns)
  return "custom";
}


/**
 * Calculate price multiplier based on frequency and selected days
 *
 * Weekend surcharge (1.5x) ONLY when:
 * - Frequency is "weekends" OR
 * - Custom frequency with Sat+Sun only AND total days <= 3
 *
 * Otherwise: 1.0x (standard)
 */
export function calculateMultiplier(days: number[], frequency: Frequency): number {
  // Weekends frequency always gets 1.5x
  if (frequency === "weekends") {
    return 1.5;
  }

  // Custom with Sat+Sun selected AND 3 or fewer days total
  if (frequency === "custom") {
    const sorted = [...days].sort((a, b) => a - b);
    const hasSatAndSun = sorted.includes(0) && sorted.includes(6);
    const isWeekendFocused = hasSatAndSun && days.length <= 3;

    if (isWeekendFocused) {
      return 1.5;
    }
  }

  // All other frequencies: standard 1x
  return 1.0;
}

/**
 * Calculate total price
 */
export function calculatePrice(
  basePrice: number,
  daysCount: number,
  frequency: Frequency,
  days: number[]
): number {
  const multiplier = calculateMultiplier(days, frequency);
  return Math.round(basePrice * daysCount * multiplier);
}

/**
 * Get human-readable label for frequency
 */
export function getFrequencyLabel(frequency: Frequency, daysCount: number = 0): string {
  switch (frequency) {
    case "daily":
      return "Every day";
    case "weekends":
      return "Weekends only ✨ Premium";
    case "alternate":
      return "Every other day";
    case "weekly":
      return daysCount === 1 ? "Weekly" : "Custom weekly";
    case "custom":
      return `${daysCount} selected days`;
    default:
      return "Select schedule";
  }
}

/**
 * Get the calendar start offset based on current IST time
 * Before 5 PM IST: offset = 1 (today+1)
 * After 5 PM IST: offset = 2 (today+2)
 */
export function getCalendarStartOffset(): number {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istTime.getHours();

  const baseOffset = hours >= 17 ? 2 : 1;

  // Enforce May 1, 2026 as the earliest delivery date
  const launchDate = new Date('2026-05-01T00:00:00');
  const earliest = new Date(istTime);
  earliest.setDate(earliest.getDate() + baseOffset);
  earliest.setHours(0, 0, 0, 0);

  if (earliest < launchDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const today = new Date(istTime);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((launchDate.getTime() - today.getTime()) / msPerDay);
  }

  return baseOffset;
}

/**
 * Shortcut handlers
 */
export function applyDailyShortcut(): number[] {
  return [0, 1, 2, 3, 4, 5, 6];
}

export function applyAlternateShortcut(startDate?: string): number[] {
  // Alternate = Mon (1), Wed (3), Fri (5)
  return [1, 3, 5];
}

export function applyWeekendsShortcut(): number[] {
  return [0, 6]; // Sunday and Saturday
}

/**
 * UI State structure
 */
export interface ScheduleState {
  selectedDays: number[]; // 0=Sun, 6=Sat
  frequency: Frequency;
  multiplier: number;
  pricePerDay: number;
  totalPrice: number;
}

/**
 * Create schedule state
 */
export function createScheduleState(
  selectedDays: number[],
  startDate: string,
  basePrice: number,
  daysCount: number
): ScheduleState {
  const frequency = detectFrequency(selectedDays, startDate);
  const multiplier = calculateMultiplier(selectedDays, frequency);
  const pricePerDay = Math.round(basePrice * multiplier);
  const totalPrice = Math.round(basePrice * daysCount * multiplier);

  return {
    selectedDays: [...selectedDays].sort((a, b) => a - b),
    frequency,
    multiplier,
    pricePerDay,
    totalPrice,
  };
}

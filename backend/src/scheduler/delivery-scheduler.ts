/**
 * Delivery Scheduling Engine
 *
 * Generates a merged, fulfillment-ready delivery queue for subscriptions
 * with add-ons that may share or differ from the base schedule.
 *
 * Design constraints:
 *  - Pure functions, no side effects, inputs never mutated
 *  - No external date libraries — all date logic implemented here
 *  - Timezone-safe: dates are always "YYYY-MM-DD" strings, never Date objects
 *  - O(D) per subscription (D = days in range), O(D·A) for merge
 *  - Scales to 100k+ subscriptions via stateless per-subscription calls
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Frequency = "daily" | "alternate" | "weekly" | "custom";

export interface Subscription {
  id: string;
  startDate: string;        // "YYYY-MM-DD"
  frequency: Frequency;
  deliveryDays?: number[];  // 0=Sun … 6=Sat; required for weekly/custom
  skipDates?: string[];     // explicit one-off skips
  pauseDates?: string[];    // paused dates (treated same as skip)
}

export type AddonType = "same_as_subscription" | "recurring" | "one_time" | "custom";

export interface Addon {
  id: string;
  type: AddonType;
  startDate?: string;       // required for recurring / one_time
  frequency?: Frequency;    // required for recurring
  deliveryDays?: number[];  // for weekly/custom recurring
  customDates?: string[];   // required for type="custom"
}

export interface DateRange {
  from: string;  // "YYYY-MM-DD", inclusive
  to: string;    // "YYYY-MM-DD", inclusive
}

export interface DeliveryItem {
  type: "subscription" | "addon";
  id: string;
}

/** Fulfillment-ready queue, keyed by "YYYY-MM-DD", sorted ascending. */
export type DeliveryQueue = Record<string, DeliveryItem[]>;

// ─── Internal date utilities ──────────────────────────────────────────────────
//
// All arithmetic is done on "day numbers" — integer offsets from 2000-01-01.
// This sidesteps DST, timezone, and JS Date month-index quirks entirely.

const DAYS_IN_MONTH_COMMON = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  return month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH_COMMON[month];
}

/**
 * Validate and parse "YYYY-MM-DD" → { year, month, day }.
 * Throws a descriptive error on malformed input.
 */
function parseDate(dateStr: string): { year: number; month: number; day: number } {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid date format: "${dateStr}". Expected "YYYY-MM-DD".`);
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month ${month} in date "${dateStr}".`);
  }
  const maxDay = daysInMonth(month, year);
  if (day < 1 || day > maxDay) {
    throw new Error(`Invalid day ${day} for ${year}-${month} in date "${dateStr}".`);
  }
  return { year, month, day };
}

/**
 * Convert "YYYY-MM-DD" to an integer day number, where 2000-01-01 = 0.
 * Stable across all platforms — no timezone involvement.
 */
function dateToDayNumber(dateStr: string): number {
  const { year, month, day } = parseDate(dateStr);
  let n = 0;
  // Sum full years from 2000 up to (but not including) target year
  for (let y = 2000; y < year; y++) n += isLeapYear(y) ? 366 : 365;
  // Sum full months in target year
  for (let m = 1; m < month; m++) n += daysInMonth(m, year);
  // Add remaining days (0-indexed within month)
  return n + day - 1;
}

/**
 * Convert an integer day number back to "YYYY-MM-DD".
 * Inverse of dateToDayNumber.
 */
function dayNumberToDate(n: number): string {
  // Handle negative day numbers (dates before 2000-01-01)
  if (n < 0) throw new Error(`Day number ${n} is before 2000-01-01 (out of supported range).`);
  let year = 2000;
  while (true) {
    const diy = isLeapYear(year) ? 366 : 365;
    if (n < diy) break;
    n -= diy;
    year++;
  }
  let month = 1;
  while (true) {
    const dim = daysInMonth(month, year);
    if (n < dim) break;
    n -= dim;
    month++;
  }
  const day = n + 1;
  return (
    `${year}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  );
}

/**
 * Tomohiko Sakamoto's algorithm — day-of-week without any Date object.
 * Returns 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.
 */
function getDayOfWeek(dateStr: string): number {
  const { year, month, day } = parseDate(dateStr);
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = month < 3 ? year - 1 : year;
  return (
    (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) +
      t[month - 1] + day) % 7
  );
}

/**
 * Lexicographic compare of two "YYYY-MM-DD" strings.
 * Safe because the zero-padded ISO format preserves chronological order.
 * Returns negative / 0 / positive.
 */
function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateDateRange(range: DateRange): void {
  if (!range || typeof range !== "object") throw new Error("range must be an object.");
  parseDate(range.from);
  parseDate(range.to);
  if (compareDates(range.from, range.to) > 0) {
    throw new Error(
      `range.from "${range.from}" must not be after range.to "${range.to}".`
    );
  }
}

function validateSubscription(sub: Subscription): void {
  if (!sub || !sub.id) throw new Error("Subscription must have an id.");
  parseDate(sub.startDate);
  const validFreqs: Frequency[] = ["daily", "alternate", "weekly", "custom"];
  if (!validFreqs.includes(sub.frequency)) {
    throw new Error(
      `Subscription "${sub.id}": invalid frequency "${sub.frequency}".`
    );
  }
  if (
    (sub.frequency === "weekly" || sub.frequency === "custom") &&
    (!sub.deliveryDays || sub.deliveryDays.length === 0)
  ) {
    throw new Error(
      `Subscription "${sub.id}": frequency "${sub.frequency}" requires deliveryDays.`
    );
  }
  if (sub.deliveryDays) {
    for (const d of sub.deliveryDays) {
      if (d < 0 || d > 6) {
        throw new Error(
          `Subscription "${sub.id}": deliveryDay ${d} is out of range (0–6).`
        );
      }
    }
  }
}

function validateAddon(addon: Addon): void {
  if (!addon || !addon.id) throw new Error("Addon must have an id.");
  const validTypes: AddonType[] = [
    "same_as_subscription", "recurring", "one_time", "custom",
  ];
  if (!validTypes.includes(addon.type)) {
    throw new Error(`Addon "${addon.id}": invalid type "${addon.type}".`);
  }
  if (addon.type === "recurring") {
    if (!addon.startDate) {
      throw new Error(`Addon "${addon.id}" (recurring): missing startDate.`);
    }
    if (!addon.frequency) {
      throw new Error(`Addon "${addon.id}" (recurring): missing frequency.`);
    }
    parseDate(addon.startDate);
  }
  if (addon.type === "one_time") {
    if (!addon.startDate) {
      throw new Error(`Addon "${addon.id}" (one_time): missing startDate.`);
    }
    parseDate(addon.startDate);
  }
  if (addon.type === "custom") {
    if (!addon.customDates || addon.customDates.length === 0) {
      throw new Error(`Addon "${addon.id}" (custom): missing customDates.`);
    }
    addon.customDates.forEach((d) => parseDate(d)); // validate each
  }
}

// ─── Core: Subscription date generator ───────────────────────────────────────

/**
 * generateSubscriptionDates
 *
 * Returns a Set of "YYYY-MM-DD" strings on which the subscription should
 * deliver within [range.from, range.to].
 *
 * Algorithm:
 *  1. Clamp effective window to [max(startDate, range.from), range.to].
 *  2. Iterate day-by-day as integers (avoiding string overhead in the loop).
 *  3. For each day, apply the frequency predicate.
 *  4. Skip any date in skipDates ∪ pauseDates (O(1) Set lookup).
 *
 * Time:  O(D)       where D = days in effective window
 * Space: O(D)       for the result Set
 *
 * @param subscription - Subscription configuration
 * @param range        - Inclusive date window
 */
export function generateSubscriptionDates(
  subscription: Subscription,
  range: DateRange
): Set<string> {
  validateSubscription(subscription);
  validateDateRange(range);

  const {
    startDate,
    frequency,
    deliveryDays = [],
    skipDates = [],
    pauseDates = [],
  } = subscription;

  // O(1) exclusion lookups
  const excludeSet = new Set([...skipDates, ...pauseDates]);

  // Clamp: don't generate dates before the subscription actually starts
  const effectiveFrom =
    compareDates(startDate, range.from) > 0 ? startDate : range.from;

  if (compareDates(effectiveFrom, range.to) > 0) {
    // Subscription starts after the range window — nothing to deliver
    return new Set<string>();
  }

  // Integer anchors
  const startDayNum   = dateToDayNumber(startDate);   // for alternate-day offset
  const currentStart  = dateToDayNumber(effectiveFrom);
  const rangeEnd      = dateToDayNumber(range.to);

  const deliveryDaySet = new Set(deliveryDays);
  const result = new Set<string>();

  for (let day = currentStart; day <= rangeEnd; day++) {
    let delivers = false;

    switch (frequency) {
      case "daily":
        delivers = true;
        break;

      case "alternate": {
        // Anchor the every-other-day rhythm to the subscription's own startDate.
        // This ensures continuity even when the range window starts mid-cycle.
        const offset = day - startDayNum;
        delivers = offset >= 0 && offset % 2 === 0;
        break;
      }

      case "weekly":
      case "custom": {
        // Convert the integer day back to a date string only for getDayOfWeek.
        // This is the only per-day string operation; kept outside hot-path
        // alternatives where possible.
        const dateStr = dayNumberToDate(day);
        delivers = deliveryDaySet.has(getDayOfWeek(dateStr));
        break;
      }

      default:
        throw new Error(`Unhandled frequency: "${frequency}"`);
    }

    if (delivers) {
      const dateStr = dayNumberToDate(day);
      if (!excludeSet.has(dateStr)) {
        result.add(dateStr);
      }
    }
  }

  return result;
}

// ─── Core: Addon date generator ───────────────────────────────────────────────

/**
 * generateAddonDates
 *
 * Returns the Set of delivery dates for a single addon within [range.from, range.to].
 *
 * Dispatch table:
 *  same_as_subscription → shallow clone of subscriptionDates (O(D))
 *  recurring            → treat as a mini-subscription (O(D))
 *  one_time             → single date if in range (O(1))
 *  custom               → filter customDates to range (O(C))
 *
 * @param addon              - Addon configuration
 * @param subscriptionDates  - Already-computed subscription dates (read-only)
 * @param range              - Inclusive date window
 */
export function generateAddonDates(
  addon: Addon,
  subscriptionDates: Readonly<Set<string>>,
  range: DateRange
): Set<string> {
  validateAddon(addon);
  validateDateRange(range);

  switch (addon.type) {
    case "same_as_subscription":
      // Clone — never return the original Set to prevent external mutation
      return new Set(subscriptionDates);

    case "recurring": {
      // Reuse the subscription scheduler with the addon's own parameters
      const pseudoSubscription: Subscription = {
        id: addon.id,
        startDate: addon.startDate!,
        frequency: addon.frequency!,
        deliveryDays: addon.deliveryDays,
        // Recurring addons don't carry skip/pause — they have their own lifecycle
      };
      return generateSubscriptionDates(pseudoSubscription, range);
    }

    case "one_time": {
      const date = addon.startDate!;
      if (
        compareDates(date, range.from) >= 0 &&
        compareDates(date, range.to) <= 0
      ) {
        return new Set([date]);
      }
      return new Set<string>();
    }

    case "custom": {
      const result = new Set<string>();
      for (const date of addon.customDates!) {
        if (
          compareDates(date, range.from) >= 0 &&
          compareDates(date, range.to) <= 0
        ) {
          result.add(date); // Set handles duplicates within customDates
        }
      }
      return result;
    }

    default:
      throw new Error(`Unknown addon type: "${(addon as any).type}"`);
  }
}

// ─── Core: Merge ──────────────────────────────────────────────────────────────

/**
 * mergeDeliveryQueue
 *
 * Combines subscription dates and all addon date sets into a single
 * DeliveryQueue, sorted chronologically.
 *
 * Guarantees:
 *  - No duplicate DeliveryItem entries per date
 *  - Subscription appears before addons on the same date
 *  - Addons appear in the order they were passed in addonDateMaps
 *  - Dates with zero deliveries are omitted
 *
 * Time:  O(D·A + D log D)  where D = unique dates, A = addon count
 * Space: O(D·A)
 *
 * @param subscriptionId  - ID of the base subscription
 * @param subscriptionDates - Dates the subscription delivers
 * @param addonDateMaps   - Per-addon { addonId, dates } array (order preserved)
 */
export function mergeDeliveryQueue(
  subscriptionId: string,
  subscriptionDates: Readonly<Set<string>>,
  addonDateMaps: ReadonlyArray<{ addonId: string; dates: Set<string> }>
): DeliveryQueue {
  if (!subscriptionId) throw new Error("subscriptionId is required for merge.");

  // Phase 1: Collect all unique delivery dates across subscription + all addons
  const allDates = new Set<string>(subscriptionDates);
  for (const { dates } of addonDateMaps) {
    for (const d of dates) allDates.add(d);
  }

  // Phase 2: Sort — lexicographic sort is chronological for ISO "YYYY-MM-DD"
  const sortedDates = Array.from(allDates).sort();

  // Phase 3: Build the queue
  const queue: DeliveryQueue = {};

  for (const date of sortedDates) {
    const items: DeliveryItem[] = [];

    // Subscription first (if it delivers on this date)
    if (subscriptionDates.has(date)) {
      items.push({ type: "subscription", id: subscriptionId });
    }

    // Then addons, preserving input order
    for (const { addonId, dates } of addonDateMaps) {
      if (dates.has(date)) {
        items.push({ type: "addon", id: addonId });
      }
    }

    // Only include dates that have at least one delivery
    if (items.length > 0) {
      queue[date] = items;
    }
  }

  return queue;
}

// ─── Public API: Top-level orchestrator ───────────────────────────────────────

/**
 * buildDeliveryQueue
 *
 * Entry point for the scheduling engine. Validates all inputs, generates
 * delivery dates for the subscription and each addon, then merges into
 * a fulfillment-ready queue.
 *
 * Example:
 *   const queue = buildDeliveryQueue(subscription, addons, { from, to });
 *   // queue["2026-04-05"] => [{ type:"subscription", id:"sub_1" }, ...]
 *
 * @param subscription - Base subscription object
 * @param addons       - Array of addon configurations
 * @param range        - Inclusive date window to generate deliveries within
 * @returns DeliveryQueue sorted by date ascending
 */
export function buildDeliveryQueue(
  subscription: Subscription,
  addons: Addon[],
  range: DateRange
): DeliveryQueue {
  // Validate all inputs upfront — fail fast with descriptive errors
  validateSubscription(subscription);
  for (const addon of addons) validateAddon(addon);
  validateDateRange(range);

  // Step 1: Generate base subscription dates
  const subscriptionDates = generateSubscriptionDates(subscription, range);

  // Step 2: Generate dates for each addon (parallelisable if needed)
  const addonDateMaps = addons.map((addon) => ({
    addonId: addon.id,
    dates: generateAddonDates(addon, subscriptionDates, range),
  }));

  // Step 3: Merge into single sorted queue
  return mergeDeliveryQueue(subscription.id, subscriptionDates, addonDateMaps);
}

// ─── Batch helper (100k scale) ────────────────────────────────────────────────

/**
 * buildDeliveryQueues (batch)
 *
 * Processes multiple [subscription, addons] pairs over the same range.
 * Returns a Map keyed by subscription id.
 *
 * At 100k subscriptions with a 30-day range:
 *   - 3M day-iterations (fast integer arithmetic)
 *   - Memory: ~100k Set<string> objects, each ≤30 entries
 *   - For streaming use cases, use a generator variant instead
 *
 * @param jobs    - Array of { subscription, addons } pairs
 * @param range   - Shared date window
 */
export function buildDeliveryQueues(
  jobs: Array<{ subscription: Subscription; addons: Addon[] }>,
  range: DateRange
): Map<string, DeliveryQueue> {
  validateDateRange(range);
  const result = new Map<string, DeliveryQueue>();
  for (const { subscription, addons } of jobs) {
    result.set(subscription.id, buildDeliveryQueue(subscription, addons, range));
  }
  return result;
}

// ─── Exported date utilities (for tests / consumers) ─────────────────────────

export const _internal = {
  parseDate,
  dateToDayNumber,
  dayNumberToDate,
  getDayOfWeek,
  compareDates,
  isLeapYear,
  daysInMonth,
};

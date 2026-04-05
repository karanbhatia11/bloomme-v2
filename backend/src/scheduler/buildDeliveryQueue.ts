// ─────────────────────────────────────────────────────────────────────────────
// buildDeliveryQueue — Deterministic Delivery Scheduling Engine  v3
//
// v1 — initial implementation
// v2 — skipDates, addon startDate/endDate, null sub, dedup by id
// v3 — ops edge cases:
//   + Subscription.pauseDates  (OPS-3: paused days excluded from sub, not addons)
//   + Subscription.endDate     (OPS-5: sub stops; independent addons continue)
//   + Type-priority ordering   (OPS-10: sub → same_as_sub → recurring → one_time)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────────────

export type Frequency = "daily" | "alternate" | "weekly";
export type AddonType = "same_as_subscription" | "recurring" | "one_time";

export interface Subscription {
  id: string;
  startDate: string;        // "YYYY-MM-DD" — first possible delivery
  endDate?: string;         // "YYYY-MM-DD" — last delivery (inclusive); OPS-5
  frequency: Frequency;
  deliveryDays?: number[];  // 0=Sun … 6=Sat, required when frequency="weekly"
  customDates?: string[];   // explicit list of delivery dates for custom schedules
  skipDates?: string[];     // one-off exclusions (holiday, manual skip)
  pauseDates?: string[];    // paused days — same effect as skipDates on sub; OPS-3
}

export interface Addon {
  id: string;
  type: AddonType;
  startDate?: string;       // effective start; for same_as_subscription it gates which sub dates count
  endDate?: string;         // effective end  (inclusive)
  frequency?: Frequency;    // required for type="recurring"
  deliveryDays?: number[];  // required when frequency="weekly"
  customDates?: string[];   // explicit list of delivery dates (custom scheduling)
  date?: string;            // required for type="one_time"
}

export interface DeliveryItem {
  type: "subscription" | "addon";
  id: string;
}

export type DeliveryQueue = Record<string, DeliveryItem[]>;

// ─── Type-priority for deterministic addon ordering (OPS-10) ─────────────────
// Guaranteed output order within a date: sub → same_as_subscription → recurring → one_time
const TYPE_PRIORITY: Record<AddonType, number> = {
  same_as_subscription: 0,
  recurring:            1,
  one_time:             2,
};

// ─── Date utilities ───────────────────────────────────────────────────────────
// All arithmetic on integer "day numbers" from 2000-01-01.
// Zero Date objects — fully timezone-safe.

const DAYS_IN_MONTH = [0,31,28,31,30,31,30,31,31,30,31,30,31];

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function dim(m: number, y: number): number {
  return m === 2 && isLeap(y) ? 29 : DAYS_IN_MONTH[m];
}

/** "YYYY-MM-DD" → integer day offset from 2000-01-01 */
function toDayNum(s: string): number {
  const [y, m, d] = s.split("-").map(Number);
  let n = 0;
  for (let yr = 2000; yr < y; yr++) n += isLeap(yr) ? 366 : 365;
  for (let mo = 1; mo < m; mo++) n += dim(mo, y);
  return n + d - 1;
}

/** Integer day offset → "YYYY-MM-DD" */
function fromDayNum(n: number): string {
  let y = 2000;
  for (;;) { const dy = isLeap(y) ? 366 : 365; if (n < dy) break; n -= dy; y++; }
  let m = 1;
  for (;;) { const dm = dim(m, y); if (n < dm) break; n -= dm; m++; }
  return `${y}-${String(m).padStart(2,"0")}-${String(n+1).padStart(2,"0")}`;
}

/** Day-of-week via Tomohiko Sakamoto — 0=Sun … 6=Sat. No Date() used. */
function dow(s: string): number {
  const [y, m, d] = s.split("-").map(Number);
  const t = [0,3,2,5,0,3,5,1,4,6,2,4];
  const yr = m < 3 ? y - 1 : y;
  return (yr + (yr>>2) - Math.floor(yr/100) + Math.floor(yr/400) + t[m-1] + d) % 7;
}

// ─── Core date generator ─────────────────────────────────────────────────────

/**
 * generateDates
 *
 * Returns a Set<string> of "YYYY-MM-DD" dates within [from, to] on which
 * the given schedule { startDate, frequency, deliveryDays } delivers,
 * after subtracting the skipSet.
 *
 * @param startDate    No delivery before this (schedule anchor for alternate)
 * @param frequency    daily | alternate | weekly
 * @param deliveryDays Day-of-week whitelist (weekly only)
 * @param from         Window start (inclusive)
 * @param to           Window end   (inclusive)
 * @param skipDates    Dates to exclude — O(1) per lookup
 */
function generateDates(
  startDate: string,
  frequency: Frequency,
  deliveryDays: number[] = [],
  from: string,
  to: string,
  skipDates: string[] = []
): Set<string> {
  const effectiveFrom = startDate > from ? startDate : from;
  if (effectiveFrom > to) return new Set();

  const anchorNum = toDayNum(startDate);   // alternate-day cycle is relative to anchor
  const startNum  = toDayNum(effectiveFrom);
  const endNum    = toDayNum(to);
  const dowSet    = new Set(deliveryDays);
  const skipSet   = new Set(skipDates);
  const result    = new Set<string>();

  for (let n = startNum; n <= endNum; n++) {
    let hit = false;
    if (frequency === "daily") {
      hit = true;
    } else if (frequency === "alternate") {
      // Anchored to startDate so mid-range windows don't reset the cycle
      hit = (n - anchorNum) % 2 === 0;
    } else if (frequency === "weekly") {
      hit = dowSet.has(dow(fromDayNum(n)));
    }
    if (hit) {
      const dateStr = fromDayNum(n);
      if (!skipSet.has(dateStr)) result.add(dateStr);
    }
  }
  return result;
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * buildDeliveryQueue
 *
 * Generates a merged, sorted, fulfillment-ready delivery queue for a
 * subscription (optional) and its add-ons within [from, to].
 *
 * Guarantees:
 *  ① Subscription first, then addons sorted by type-priority
 *     (same_as_subscription → recurring → one_time), preserving
 *     relative input order within each type group
 *  ② Same-day deliveries merged under one date key (no duplicate keys)
 *  ③ No duplicate DeliveryItem entries per date (dedup by addon id)
 *  ④ Output keys sorted ascending
 *  ⑤ Inputs never mutated
 *  ⑥ null subscription → addon-only mode
 *  ⑦ Subscription.pauseDates excluded from sub but NOT from independent addons
 *  ⑧ Subscription.endDate stops sub delivery; independent addons continue in range
 *
 * @param subscription  Base subscription config, or null
 * @param addons        Addon array (processed in type-priority order)
 * @param from          "YYYY-MM-DD" range start (inclusive)
 * @param to            "YYYY-MM-DD" range end   (inclusive)
 */
export function buildDeliveryQueue(
  subscription: Subscription | null,
  addons: Addon[],
  from: string,
  to: string
): DeliveryQueue {

  // ── 1. Subscription dates ──────────────────────────────────────────────────
  // Merge skipDates + pauseDates into one exclusion list.
  // Clamp the effective window to [startDate, min(endDate, to)].
  let subDates: Set<string> = new Set();
  if (subscription) {
    const subTo = subscription.endDate && subscription.endDate < to
      ? subscription.endDate   // OPS-5: subscription ends before range end
      : to;

    // If customDates are provided, use those directly; otherwise use frequency-based generation
    if (subscription.customDates && subscription.customDates.length > 0) {
      subDates = new Set(subscription.customDates.filter(d => d >= from && d <= subTo));
    } else {
      const excluded = [
        ...(subscription.skipDates  ?? []),
        ...(subscription.pauseDates ?? []),  // OPS-3: pause treated same as skip for sub
      ];
      subDates = generateDates(
        subscription.startDate,
        subscription.frequency,
        subscription.deliveryDays,
        from,
        subTo,
        excluded
      );
    }
  }

  // ── 2. Deduplicate addons by id (last definition wins) ───────────────────
  const seen = new Set<string>();
  const uniqueAddons = [...addons].reverse().filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  }).reverse();

  // ── 3. Sort addons by type-priority for deterministic output (OPS-10) ─────
  // Stable sort: preserve relative input order within the same type bucket.
  const orderedAddons = [...uniqueAddons].sort(
    (a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]
  );

  // ── 4. Generate dates for each addon ──────────────────────────────────────
  const addonDateMaps: Array<{ id: string; dates: Set<string> }> =
    orderedAddons.map((addon) => {
      let dates: Set<string>;

      if (addon.type === "same_as_subscription") {
        // Clone sub dates, then clip to this addon's own [startDate, endDate] window.
        // Note: same_as_subscription is NOT affected by sub pauseDates beyond what
        // was already excluded when building subDates — it mirrors the sub's actual
        // delivery days, including any gaps from pauses.
        const cloned = new Set(subDates);
        if (addon.startDate) {
          for (const d of cloned) { if (d < addon.startDate) cloned.delete(d); }
        }
        if (addon.endDate) {
          for (const d of cloned) { if (d > addon.endDate) cloned.delete(d); }
        }
        dates = cloned;

      } else if (addon.type === "recurring") {
        // Independent schedule — not affected by sub's pauseDates (OPS-3)
        // If customDates are provided, use those directly; otherwise use frequency-based generation
        if (addon.customDates && addon.customDates.length > 0) {
          dates = new Set(addon.customDates.filter(d => d >= from && d <= to));
        } else {
          const effectiveTo = addon.endDate && addon.endDate < to ? addon.endDate : to;
          dates = generateDates(
            addon.startDate ?? from,
            addon.frequency!,
            addon.deliveryDays,
            from,
            effectiveTo
          );
        }

      } else /* one_time */ {
        const d = addon.date!;
        dates = (d >= from && d <= to) ? new Set([d]) : new Set();
      }

      return { id: addon.id, dates };
    });

  // ── 5. Union all unique dates ──────────────────────────────────────────────
  const allDates = new Set<string>(subDates);
  for (const { dates } of addonDateMaps) {
    for (const d of dates) allDates.add(d);
  }

  // ── 6. Sort ascending ─────────────────────────────────────────────────────
  const sorted = Array.from(allDates).sort();

  // ── 7. Build merged queue ─────────────────────────────────────────────────
  const queue: DeliveryQueue = {};
  for (const date of sorted) {
    const items: DeliveryItem[] = [];
    if (subscription && subDates.has(date)) {
      items.push({ type: "subscription", id: subscription.id });
    }
    for (const { id, dates } of addonDateMaps) {
      if (dates.has(date)) items.push({ type: "addon", id });
    }
    queue[date] = items;
  }

  return queue;
}

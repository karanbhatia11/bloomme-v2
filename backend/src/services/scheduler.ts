// ─────────────────────────────────────────────────────────────────────────────
// Scheduler Service — DB ↔ buildDeliveryQueue bridge
//
// Responsibilities:
//   • Load subscription + addon config from DB
//   • Call buildDeliveryQueue (pure function, no I/O)
//   • Upsert results into deliveries + delivery_items tables
// ─────────────────────────────────────────────────────────────────────────────

import pool from '../db';
import {
  buildDeliveryQueue,
  Subscription,
  Addon,
  Frequency,
  AddonType,
} from '../scheduler/buildDeliveryQueue';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GenerateResult {
  subscriptionId: number;
  datesGenerated: number;
  datesSkipped: number;      // already existed (upsert conflict)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as "YYYY-MM-DD" in IST. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns the date N days from today as "YYYY-MM-DD" in UTC. */
function daysFromToday(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Core: generate deliveries for one subscription ──────────────────────────

/**
 * generateForSubscription
 *
 * Loads subscription + its add-ons from DB, runs buildDeliveryQueue,
 * then upserts the results as deliveries + delivery_items rows.
 *
 * Idempotent — safe to run multiple times; existing rows are left unchanged
 * (ON CONFLICT DO NOTHING).
 *
 * @param subscriptionId  DB primary key of the subscription
 * @param from            "YYYY-MM-DD" window start (default: today)
 * @param to              "YYYY-MM-DD" window end   (default: 30 days out)
 */
export async function generateForSubscription(
  subscriptionId: number,
  from: string = today(),
  to: string = daysFromToday(30),
): Promise<GenerateResult> {
  // ── 1. Load subscription row ────────────────────────────────────────────
  const subRow = await pool.query(
    `SELECT id, plan_type, frequency, delivery_days, start_date,
            end_date, pause_dates, skip_dates, status
     FROM subscriptions WHERE id = $1`,
    [subscriptionId],
  );

  if (subRow.rows.length === 0) {
    throw new Error(`Subscription ${subscriptionId} not found`);
  }

  const row = subRow.rows[0];

  if (row.status === 'cancelled') {
    return { subscriptionId, datesGenerated: 0, datesSkipped: 0 };
  }

  // Map DB row → buildDeliveryQueue Subscription type
  const subscription: Subscription = {
    id: String(row.id),
    startDate: row.start_date
      ? (row.start_date instanceof Date
          ? row.start_date.toISOString().slice(0, 10)
          : String(row.start_date).slice(0, 10))
      : from,
    frequency: (row.frequency as Frequency) || 'daily',
    endDate: row.end_date
      ? (row.end_date instanceof Date
          ? row.end_date.toISOString().slice(0, 10)
          : String(row.end_date).slice(0, 10))
      : undefined,
    deliveryDays: parseNumericArray(row.delivery_days),
    skipDates: parseDateArray(row.skip_dates),
    pauseDates: parseDateArray(row.pause_dates),
  };

  // ── 2. Load add-ons ─────────────────────────────────────────────────────
  const addonRows = await pool.query(
    `SELECT sa.add_on_id, sa.addon_type, sa.addon_frequency,
            sa.addon_delivery_days, sa.addon_start_date, sa.addon_end_date,
            sa.one_off_date
     FROM subscription_add_ons sa
     WHERE sa.subscription_id = $1`,
    [subscriptionId],
  );

  const addons: Addon[] = addonRows.rows.map((ar: any) => ({
    id: String(ar.add_on_id),
    type: (ar.addon_type as AddonType) || 'same_as_subscription',
    frequency: ar.addon_frequency as Frequency | undefined,
    deliveryDays: parseNumericArray(ar.addon_delivery_days),
    startDate: ar.addon_start_date
      ? toDateStr(ar.addon_start_date)
      : undefined,
    endDate: ar.addon_end_date
      ? toDateStr(ar.addon_end_date)
      : undefined,
    date: ar.one_off_date
      ? toDateStr(ar.one_off_date)
      : undefined,
  }));

  // ── 3. Build queue ───────────────────────────────────────────────────────
  const queue = buildDeliveryQueue(subscription, addons, from, to);

  // ── 4. Upsert results ────────────────────────────────────────────────────
  let datesGenerated = 0;
  let datesSkipped = 0;

  for (const [dateStr, items] of Object.entries(queue)) {
    // Upsert delivery row (idempotent)
    const upsert = await pool.query(
      `INSERT INTO deliveries (subscription_id, delivery_date, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (subscription_id, delivery_date) DO NOTHING
       RETURNING id`,
      [subscriptionId, dateStr],
    );

    if (upsert.rows.length === 0) {
      // Row already existed — skip items to avoid duplicates
      datesSkipped++;
      continue;
    }

    datesGenerated++;
    const deliveryId: number = upsert.rows[0].id;

    // Insert delivery_items for this date
    for (const item of items) {
      await pool.query(
        `INSERT INTO delivery_items (delivery_id, item_type, item_ref_id)
         VALUES ($1, $2, $3)`,
        [deliveryId, item.type, item.id],
      );
    }
  }

  return { subscriptionId, datesGenerated, datesSkipped };
}

// ─── Batch: all active subscriptions ────────────────────────────────────────

/**
 * generateForAllActive
 *
 * Iterates all active (and paused) subscriptions and generates deliveries
 * for the given window. Paused subscriptions are included so their pause
 * dates are correctly reflected in the delivery queue.
 *
 * @param from  Window start (default: today)
 * @param to    Window end   (default: 30 days out)
 */
export async function generateForAllActive(
  from: string = today(),
  to: string = daysFromToday(30),
): Promise<GenerateResult[]> {
  const subs = await pool.query(
    `SELECT id FROM subscriptions WHERE status IN ('active', 'paused')`,
  );

  const results: GenerateResult[] = [];
  for (const sub of subs.rows) {
    try {
      const result = await generateForSubscription(sub.id, from, to);
      results.push(result);
    } catch (err) {
      console.error(`[scheduler] Failed for subscription ${sub.id}:`, err);
      results.push({ subscriptionId: sub.id, datesGenerated: 0, datesSkipped: 0 });
    }
  }

  return results;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function parseNumericArray(val: any): number[] | undefined {
  if (!val) return undefined;
  const arr = Array.isArray(val) ? val : (() => { try { return JSON.parse(val); } catch { return undefined; } })();
  if (!Array.isArray(arr)) return undefined;
  return arr.map(Number);
}

function parseDateArray(val: any): string[] | undefined {
  if (!val) return undefined;
  const arr = Array.isArray(val) ? val : (() => { try { return JSON.parse(val); } catch { return undefined; } })();
  if (!Array.isArray(arr)) return undefined;
  return arr.map(String);
}

function toDateStr(val: any): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

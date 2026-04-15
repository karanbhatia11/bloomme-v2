// ─────────────────────────────────────────────────────────────────────────────
// Preview Route — POST /api/preview
//
// Two modes:
//   1. Inline  — send full subscription + addon config in the request body
//   2. DB-based — send subscription_id, loads config from DB
//
// Returns: the delivery queue for the requested window (default: today + 30d)
// ─────────────────────────────────────────────────────────────────────────────

import express, { Request, Response } from 'express';
import { buildDeliveryQueue, Subscription, Addon } from '../scheduler/buildDeliveryQueue';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysFromToday(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function toDateStr(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function parseNumArr(val: any): number[] | undefined {
  if (!val) return undefined;
  const arr = Array.isArray(val) ? val : (() => { try { return JSON.parse(val); } catch { return undefined; } })();
  if (!Array.isArray(arr)) return undefined;
  return arr.map(Number);
}

function parseDateArr(val: any): string[] | undefined {
  if (!val) return undefined;
  const arr = Array.isArray(val) ? val : (() => { try { return JSON.parse(val); } catch { return undefined; } })();
  if (!Array.isArray(arr)) return undefined;
  return arr.map(String);
}

// ── POST /api/preview/inline ──────────────────────────────────────────────────

/**
 * Inline preview — caller provides the full subscription + addon config.
 * No auth required. Used by checkout UI to preview before subscribing.
 *
 * Body: { subscription, addons?, from?, to? }
 */
router.post('/inline', (req: Request, res: Response) => {
  try {
    const { subscription, addons = [], from, to } = req.body;

    // Allow subscription to be null for addon-only previews
    if (!subscription && (!addons || addons.length === 0)) {
      return res.status(400).json({ error: 'Either subscription or addons are required' });
    }

    const windowFrom: string = from ?? today();
    const windowTo: string   = to   ?? daysFromToday(30);

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(windowFrom) || !dateRegex.test(windowTo)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Sanitize subscription to ensure required fields
    let sanitizedSub: Subscription | null = null;
    if (subscription) {
      if (!subscription.startDate || !subscription.frequency) {
        return res.status(400).json({ error: 'Subscription must have startDate and frequency' });
      }
      sanitizedSub = {
        id: subscription.id || 'sub_1',
        startDate: subscription.startDate,
        frequency: subscription.frequency,
        deliveryDays: subscription.deliveryDays,
        customDates: subscription.customDates,
        skipDates: subscription.skipDates,
        pauseDates: subscription.pauseDates,
        endDate: subscription.endDate,
      };
    }

    // Sanitize addons array
    const sanitizedAddons: Addon[] = (addons || []).map((a: any) => {
      if (!a.id || !a.type) {
        throw new Error(`Addon missing required fields: id=${a.id}, type=${a.type}`);
      }
      const addon: Addon = {
        id: String(a.id),
        type: a.type,
      };
      if (a.startDate) addon.startDate = a.startDate;
      if (a.endDate) addon.endDate = a.endDate;
      if (a.frequency) addon.frequency = a.frequency as any;
      if (a.deliveryDays) addon.deliveryDays = a.deliveryDays;
      if (a.customDates) addon.customDates = a.customDates;
      if (a.date) addon.date = a.date;
      return addon;
    });

    const queue = buildDeliveryQueue(sanitizedSub, sanitizedAddons, windowFrom, windowTo);

    const dates = Object.keys(queue).sort();
    res.json({
      from: windowFrom,
      to: windowTo,
      totalDates: dates.length,
      queue,
    });
  } catch (err: any) {
    console.error('[preview/inline] Error:', err.message);
    console.error('[preview/inline] Stack:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to generate delivery preview' });
  }
});

// ── POST /api/preview/subscription/:id ───────────────────────────────────────

/**
 * DB-based preview — loads config from DB for the given subscription_id.
 * Requires auth. Used by the dashboard "upcoming deliveries" view.
 *
 * Params: subscriptionId
 * Query:  ?from=YYYY-MM-DD&to=YYYY-MM-DD  (optional)
 */
router.get(
  '/subscription/:id',
  authenticateToken as any,
  async (req: Request, res: Response) => {
    const subscriptionId = parseInt(String(req.params.id), 10);
    const userId = (req as any).user.id;

    if (isNaN(subscriptionId)) {
      return res.status(400).json({ error: 'Invalid subscription id' });
    }

    const from: string = (req.query.from as string) ?? today();
    const to: string   = (req.query.to   as string) ?? daysFromToday(30);

    try {
      // Load subscription — must belong to the requesting user
      const subRow = await pool.query(
        `SELECT id, plan_type, frequency, delivery_days, start_date,
                end_date, pause_dates, skip_dates, status
         FROM subscriptions WHERE id = $1 AND user_id = $2`,
        [subscriptionId, userId],
      );

      if (subRow.rows.length === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const row = subRow.rows[0];

      const subscription: Subscription = {
        id: String(row.id),
        startDate: row.start_date ? toDateStr(row.start_date) : from,
        frequency: row.frequency || 'daily',
        endDate:   row.end_date   ? toDateStr(row.end_date)  : undefined,
        deliveryDays: parseNumArr(row.delivery_days),
        skipDates:    parseDateArr(row.skip_dates),
        pauseDates:   parseDateArr(row.pause_dates),
      };

      // Load add-ons
      const addonRows = await pool.query(
        `SELECT sa.add_on_id, sa.one_off_date, a.name, a.price
         FROM subscription_add_ons sa
         JOIN add_ons a ON a.id = sa.add_on_id
         WHERE sa.subscription_id = $1`,
        [subscriptionId],
      );

      const addons: Addon[] = addonRows.rows
        .filter((ar: any) => ar.one_off_date) // Only include if one_off_date is set
        .map((ar: any) => ({
          id: String(ar.add_on_id),
          type: 'one_time' as const,
          date: toDateStr(ar.one_off_date),
        }));

      const queue = buildDeliveryQueue(subscription, addons, from, to);

      const dates = Object.keys(queue).sort();
      res.json({
        subscriptionId,
        from,
        to,
        totalDates: dates.length,
        queue,
      });
    } catch (err: any) {
      console.error('[preview] Error:', err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;

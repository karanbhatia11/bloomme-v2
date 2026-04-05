// ─────────────────────────────────────────────────────────────────────────────
// Daily Delivery Generation Job
//
// Runs once per day at ~00:05 UTC.
// Generates deliveries for the next 30 days for all active subscriptions.
//
// Uses a plain setInterval-based scheduler (no external cron dependency).
// The interval fires every hour; the handler only executes real work once
// per UTC calendar day, storing the last-run date in memory.
// ─────────────────────────────────────────────────────────────────────────────

import { generateForAllActive } from '../services/scheduler';

// Track the last UTC date when we ran the full generation
let lastRunDate = '';

function getUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUtcHour(): number {
  return new Date().getUTCHours();
}

async function runDailyJob(): Promise<void> {
  const today = getUtcDate();
  const hour  = getUtcHour();

  // Only run between 00:00–01:00 UTC and only once per day
  if (hour !== 0 && hour !== 1) return;
  if (lastRunDate === today) return;

  lastRunDate = today;

  console.log(`[delivery-job] Starting daily generation for ${today}`);
  try {
    const results = await generateForAllActive();
    const total = results.reduce((s, r) => s + r.datesGenerated, 0);
    const skipped = results.reduce((s, r) => s + r.datesSkipped, 0);
    console.log(
      `[delivery-job] Done. Subscriptions: ${results.length}, ` +
      `Dates inserted: ${total}, Dates already existed: ${skipped}`,
    );
  } catch (err) {
    console.error('[delivery-job] Fatal error during generation:', err);
  }
}

/**
 * startDeliveryJob
 *
 * Call once at server startup.
 * Fires the check every hour; real work runs at most once per UTC day.
 */
export function startDeliveryJob(): void {
  // Run immediately on startup so deliveries exist from day one
  runDailyJob().catch((err) =>
    console.error('[delivery-job] Startup run error:', err),
  );

  // Then check every hour
  const ONE_HOUR_MS = 60 * 60 * 1000;
  setInterval(() => {
    runDailyJob().catch((err) =>
      console.error('[delivery-job] Scheduled run error:', err),
    );
  }, ONE_HOUR_MS);

  console.log('[delivery-job] Hourly delivery-generation check registered');
}

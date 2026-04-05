/**
 * Delivery Scheduler — Example Usage
 *
 * Run with:  npx ts-node src/scheduler/example.ts
 */

import { buildDeliveryQueue, buildDeliveryQueues, Subscription, Addon, DateRange } from "./delivery-scheduler";

// ─── Example 1: Spec example ──────────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log("EXAMPLE 1 — Spec example (daily + weekly)");
console.log("═══════════════════════════════════════════");

const sub1: Subscription = {
  id: "sub_1",
  startDate: "2026-04-01",
  frequency: "daily",
};

const addons1: Addon[] = [
  { id: "addon_1", type: "same_as_subscription" },
  {
    id: "addon_2",
    type: "recurring",
    startDate: "2026-04-01",
    frequency: "weekly",
    deliveryDays: [0], // Sunday
  },
];

const range1: DateRange = { from: "2026-04-01", to: "2026-04-07" };

const queue1 = buildDeliveryQueue(sub1, addons1, range1);
console.log(JSON.stringify(queue1, null, 2));

// ─── Example 2: All addon types ───────────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log("EXAMPLE 2 — All addon types");
console.log("═══════════════════════════════════════════");

const sub2: Subscription = {
  id: "sub_2",
  startDate: "2026-04-01",
  frequency: "alternate",   // Apr 1, 3, 5, 7...
};

const addons2: Addon[] = [
  // Mirrors subscription alternate schedule
  { id: "addon_same",  type: "same_as_subscription" },

  // Delivered once on Apr 4 (regardless of subscription)
  { id: "addon_once",  type: "one_time", startDate: "2026-04-04" },

  // Custom dates — not tied to any schedule
  { id: "addon_cust",  type: "custom",  customDates: ["2026-04-02", "2026-04-06"] },

  // Weekly on Fridays (Apr 3, Apr 10...)
  {
    id: "addon_fri",
    type: "recurring",
    startDate: "2026-04-01",
    frequency: "weekly",
    deliveryDays: [5], // Friday
  },
];

const range2: DateRange = { from: "2026-04-01", to: "2026-04-07" };
const queue2 = buildDeliveryQueue(sub2, addons2, range2);
console.log(JSON.stringify(queue2, null, 2));

// ─── Example 3: Skip and pause dates ─────────────────────────────────────────

console.log("\n═══════════════════════════════════════════");
console.log("EXAMPLE 3 — Skip + pause");
console.log("═══════════════════════════════════════════");

const sub3: Subscription = {
  id: "sub_3",
  startDate: "2026-04-01",
  frequency: "daily",
  skipDates:  ["2026-04-02"],              // explicit skip
  pauseDates: ["2026-04-04", "2026-04-05"], // pause window
};

const addons3: Addon[] = [
  { id: "addon_same", type: "same_as_subscription" }, // follows sub's skip/pause
  { id: "addon_cust", type: "custom", customDates: ["2026-04-04"] }, // still delivers
];

const range3: DateRange = { from: "2026-04-01", to: "2026-04-07" };
const queue3 = buildDeliveryQueue(sub3, addons3, range3);
console.log(JSON.stringify(queue3, null, 2));
// Note: Apr 2 omitted (skip), Apr 4–5 omit subscription+same (pause)
//       but addon_cust still delivers Apr 4 (its own schedule)

// ─── Example 4: 100k subscriptions (batch, performance demo) ─────────────────

console.log("\n═══════════════════════════════════════════");
console.log("EXAMPLE 4 — Batch: 10,000 subscriptions");
console.log("═══════════════════════════════════════════");

const BATCH_SIZE = 10_000;
const RANGE_DAYS = 30;

const jobs = Array.from({ length: BATCH_SIZE }, (_, i) => ({
  subscription: {
    id: `sub_${i}`,
    startDate: "2026-04-01",
    frequency: (["daily", "alternate", "weekly"][i % 3]) as any,
    deliveryDays: i % 3 === 2 ? [1, 4] : undefined, // Mon+Thu for weekly
  },
  addons: [
    { id: `addon_${i}_same`, type: "same_as_subscription" as const },
    { id: `addon_${i}_once`, type: "one_time" as const, startDate: "2026-04-15" },
  ],
}));

const batchRange: DateRange = { from: "2026-04-01", to: "2026-04-30" };

const t0 = performance.now();
const batchResult = buildDeliveryQueues(jobs, batchRange);
const t1 = performance.now();

let totalDeliveries = 0;
for (const [, queue] of batchResult) {
  for (const items of Object.values(queue)) {
    totalDeliveries += items.length;
  }
}

console.log(`Processed ${BATCH_SIZE.toLocaleString()} subscriptions over ${RANGE_DAYS} days`);
console.log(`Total delivery items generated: ${totalDeliveries.toLocaleString()}`);
console.log(`Time: ${(t1 - t0).toFixed(1)} ms`);
console.log(`Throughput: ${Math.round(BATCH_SIZE / ((t1 - t0) / 1000)).toLocaleString()} subscriptions/sec`);

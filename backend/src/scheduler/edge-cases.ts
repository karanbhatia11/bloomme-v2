/**
 * buildDeliveryQueue — Edge Case Validation Suite
 * Run: npx ts-node --esm src/scheduler/edge-cases.ts
 */

import { buildDeliveryQueue, DeliveryQueue, DeliveryItem } from "./buildDeliveryQueue";

// ─── Tiny assertion framework ─────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(condition: boolean, testName: string, assertion: string, reason?: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    const msg = `  ✗  [${testName}] ${assertion}${reason ? `\n       Reason: ${reason}` : ""}`;
    failures.push(msg);
    console.log(msg);
  }
}

function ids(items: DeliveryItem[] | undefined) {
  return (items ?? []).map(i => `${i.type}(${i.id})`);
}

function hasItem(items: DeliveryItem[] | undefined, type: "subscription"|"addon", id: string) {
  return (items ?? []).some(x => x.type === type && x.id === id);
}

function printSection(n: number, title: string) {
  console.log(`\n  ── EC-${n}: ${title}`);
}

function printIO(input: object, output: DeliveryQueue) {
  console.log(`     Input:  ${JSON.stringify(input)}`);
  console.log(`     Output:`);
  for (const [d, items] of Object.entries(output)) {
    console.log(`       ${d} → [${ids(items).join(", ")}]`);
  }
}

// ─── Edge Case 1 — Add-on starts later than subscription ─────────────────────

printSection(1, "Add-on starts later than subscription");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [{ id:"a1",  type:"same_as_subscription" as const, startDate:"2026-04-04" }],
    from:   "2026-04-01", to: "2026-04-06",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check(!hasItem(q["2026-04-01"], "addon", "a1"),     "EC-1", "Apr 1: a1 absent (not started yet)");
  check(!hasItem(q["2026-04-02"], "addon", "a1"),     "EC-1", "Apr 2: a1 absent");
  check(!hasItem(q["2026-04-03"], "addon", "a1"),     "EC-1", "Apr 3: a1 absent");
  check( hasItem(q["2026-04-04"], "addon", "a1"),     "EC-1", "Apr 4: a1 present (startDate)");
  check( hasItem(q["2026-04-05"], "addon", "a1"),     "EC-1", "Apr 5: a1 present");
  check( hasItem(q["2026-04-06"], "addon", "a1"),     "EC-1", "Apr 6: a1 present");
  check( hasItem(q["2026-04-01"], "subscription", "sub1"), "EC-1", "Apr 1: subscription present throughout");
  check( hasItem(q["2026-04-03"], "subscription", "sub1"), "EC-1", "Apr 3: subscription present throughout");
}

// ─── Edge Case 2 — Add-on ends early ─────────────────────────────────────────

printSection(2, "Add-on ends early (endDate)");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [{ id:"a1", type:"recurring" as const, frequency:"daily" as const,
               startDate:"2026-04-02", endDate:"2026-04-04" }],
    from:   "2026-04-01", to: "2026-04-05",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check(!hasItem(q["2026-04-01"], "addon", "a1"), "EC-2", "Apr 1: a1 absent (before startDate)");
  check( hasItem(q["2026-04-02"], "addon", "a1"), "EC-2", "Apr 2: a1 present");
  check( hasItem(q["2026-04-03"], "addon", "a1"), "EC-2", "Apr 3: a1 present");
  check( hasItem(q["2026-04-04"], "addon", "a1"), "EC-2", "Apr 4: a1 present (endDate boundary)");
  check(!hasItem(q["2026-04-05"], "addon", "a1"), "EC-2", "Apr 5: a1 absent (after endDate)");
  check( hasItem(q["2026-04-05"], "subscription", "sub1"), "EC-2", "Apr 5: subscription continues");
}

// ─── Edge Case 3 — Multiple add-ons mixed types ───────────────────────────────

printSection(3, "Multiple add-ons mixed types");
{
  // 2026-04-05 is Sunday (verified: dow=0)
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [
      { id:"a1", type:"same_as_subscription" as const },
      { id:"a2", type:"recurring" as const, startDate:"2026-04-01", frequency:"weekly" as const, deliveryDays:[0] },
      { id:"a3", type:"one_time" as const, date:"2026-04-03" },
    ],
    from: "2026-04-01", to: "2026-04-05",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  // Apr 1 → sub + a1
  check( hasItem(q["2026-04-01"], "subscription","sub1"), "EC-3", "Apr 1: sub present");
  check( hasItem(q["2026-04-01"], "addon","a1"),          "EC-3", "Apr 1: a1 present");
  check(!hasItem(q["2026-04-01"], "addon","a2"),          "EC-3", "Apr 1: a2 absent (not Sunday)");
  check(!hasItem(q["2026-04-01"], "addon","a3"),          "EC-3", "Apr 1: a3 absent (not Apr 3)");
  // Apr 3 → sub + a1 + a3
  check( hasItem(q["2026-04-03"], "addon","a1"),          "EC-3", "Apr 3: a1 present");
  check( hasItem(q["2026-04-03"], "addon","a3"),          "EC-3", "Apr 3: a3 present (one_time)");
  check(!hasItem(q["2026-04-03"], "addon","a2"),          "EC-3", "Apr 3: a2 absent (not Sunday)");
  // Apr 5 → sub + a1 + a2 (Sunday)
  check( hasItem(q["2026-04-05"], "addon","a1"),          "EC-3", "Apr 5: a1 present");
  check( hasItem(q["2026-04-05"], "addon","a2"),          "EC-3", "Apr 5: a2 present (Sunday)");
  check(!hasItem(q["2026-04-05"], "addon","a3"),          "EC-3", "Apr 5: a3 absent (already fired Apr 3)");
}

// ─── Edge Case 4 — Skip dates ─────────────────────────────────────────────────

printSection(4, "skipDates on subscription");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const,
              skipDates:["2026-04-03"] },
    addons: [] as any[],
    from:   "2026-04-01", to: "2026-04-04",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check( hasItem(q["2026-04-01"], "subscription","sub1"), "EC-4", "Apr 1: sub present");
  check( hasItem(q["2026-04-02"], "subscription","sub1"), "EC-4", "Apr 2: sub present");
  check(!q["2026-04-03"],                                 "EC-4", "Apr 3: date entirely absent (skipped)");
  check( hasItem(q["2026-04-04"], "subscription","sub1"), "EC-4", "Apr 4: sub present");
}

// ─── Edge Case 5 — Alternate schedule alignment ───────────────────────────────

printSection(5, "Alternate schedule alignment");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"alternate" as const },
    addons: [] as any[],
    from:   "2026-04-01", to: "2026-04-05",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check( hasItem(q["2026-04-01"], "subscription","sub1"), "EC-5", "Apr 1: delivers (offset 0)");
  check(!q["2026-04-02"],                                 "EC-5", "Apr 2: absent (offset 1, gap day)");
  check( hasItem(q["2026-04-03"], "subscription","sub1"), "EC-5", "Apr 3: delivers (offset 2)");
  check(!q["2026-04-04"],                                 "EC-5", "Apr 4: absent (offset 3, gap day)");
  check( hasItem(q["2026-04-05"], "subscription","sub1"), "EC-5", "Apr 5: delivers (offset 4)");
}

// ─── Edge Case 6 — Weekly addon same-day merge ────────────────────────────────

printSection(6, "Weekly addon same-day merge (no duplicate date keys)");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [{ id:"a1", type:"recurring" as const, startDate:"2026-04-01",
               frequency:"weekly" as const, deliveryDays:[0] }], // Sunday
    from:   "2026-04-01", to: "2026-04-07",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  // Apr 5 is Sunday
  const sunItems = q["2026-04-05"];
  check(Array.isArray(sunItems),                              "EC-6", "Sunday has an entry");
  check(sunItems.length === 2,                                "EC-6", "Sunday has exactly 2 items (no duplicate keys)");
  check(hasItem(sunItems, "subscription","sub1"),             "EC-6", "Sunday: sub present");
  check(hasItem(sunItems, "addon","a1"),                      "EC-6", "Sunday: addon present");
  check(Object.keys(q).filter(k => k === "2026-04-05").length === 1, "EC-6", "No duplicate date keys");
}

// ─── Edge Case 7 — One-time + recurring same day ──────────────────────────────

printSection(7, "One-time + recurring same day (Apr 3)");
{
  // 2026-04-03 is a Friday (dow=5)
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [
      { id:"a1", type:"one_time" as const, date:"2026-04-03" },
      { id:"a2", type:"recurring" as const, startDate:"2026-04-01",
        frequency:"weekly" as const, deliveryDays:[5] }, // Friday
    ],
    from: "2026-04-01", to: "2026-04-05",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  const items = q["2026-04-03"];
  check(hasItem(items, "subscription","sub1"), "EC-7", "Apr 3: sub present");
  check(hasItem(items, "addon","a1"),          "EC-7", "Apr 3: one_time a1 present");
  check(hasItem(items, "addon","a2"),          "EC-7", "Apr 3: recurring a2 present (Friday)");
  check(items.length === 3,                    "EC-7", "Apr 3: exactly 3 items");
}

// ─── Edge Case 8 — Range starts after subscription ───────────────────────────

printSection(8, "Range starts after subscription (no reset)");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [] as any[],
    from:   "2026-04-05", to: "2026-04-07",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check(Object.keys(q).length === 3,          "EC-8", "Exactly 3 dates in range");
  check(hasItem(q["2026-04-05"],"subscription","sub1"), "EC-8", "Apr 5: sub present");
  check(hasItem(q["2026-04-06"],"subscription","sub1"), "EC-8", "Apr 6: sub present");
  check(hasItem(q["2026-04-07"],"subscription","sub1"), "EC-8", "Apr 7: sub present");
  check(!q["2026-04-01"],                     "EC-8", "Apr 1 not in output (before range)");
}

// ─── Edge Case 9 — Add-on before subscription start ──────────────────────────

printSection(9, "Add-on starts before subscription (same_as_subscription)");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-05", frequency:"daily" as const },
    addons: [{ id:"a1", type:"same_as_subscription" as const }],
    from:   "2026-04-01", to: "2026-04-07",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check(!q["2026-04-01"],                              "EC-9", "Apr 1: no entry (sub hasn't started)");
  check(!q["2026-04-04"],                              "EC-9", "Apr 4: no entry (sub hasn't started)");
  check(hasItem(q["2026-04-05"],"subscription","sub1"),"EC-9", "Apr 5: sub present");
  check(hasItem(q["2026-04-05"],"addon","a1"),         "EC-9", "Apr 5: addon starts with sub");
  check(hasItem(q["2026-04-06"],"addon","a1"),         "EC-9", "Apr 6: addon present");
  check(hasItem(q["2026-04-07"],"addon","a1"),         "EC-9", "Apr 7: addon present");
}

// ─── Edge Case 10 — Multiple addons same day ─────────────────────────────────

printSection(10, "Multiple addons same schedule on same day");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [
      { id:"a1", type:"same_as_subscription" as const },
      { id:"a2", type:"same_as_subscription" as const },
      { id:"a3", type:"same_as_subscription" as const },
    ],
    from: "2026-04-01", to: "2026-04-01",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  const items = q["2026-04-01"];
  check(items.length === 4,                   "EC-10", "4 items: sub + a1 + a2 + a3");
  check(hasItem(items,"subscription","sub1"), "EC-10", "sub present");
  check(hasItem(items,"addon","a1"),          "EC-10", "a1 present");
  check(hasItem(items,"addon","a2"),          "EC-10", "a2 present");
  check(hasItem(items,"addon","a3"),          "EC-10", "a3 present");
  check(ids(items)[0] === "subscription(sub1)", "EC-10", "sub is first");
}

// ─── Edge Case 11 — Empty addons ─────────────────────────────────────────────

printSection(11, "Empty addons array");
{
  const input = {
    sub:  { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    from: "2026-04-01", to: "2026-04-03",
  };
  const q = buildDeliveryQueue(input.sub, [], input.from, input.to);
  printIO(input, q);

  check(Object.keys(q).length === 3,          "EC-11", "3 date keys");
  check(q["2026-04-01"].length === 1,         "EC-11", "Apr 1: only subscription");
  check(hasItem(q["2026-04-02"],"subscription","sub1"), "EC-11", "Apr 2: subscription present");
}

// ─── Edge Case 12 — Null subscription (addon only) ────────────────────────────

printSection(12, "Null subscription — addon-only queue");
{
  const input = {
    sub:    null,
    addons: [{ id:"a1", type:"one_time" as const, date:"2026-04-03" }],
    from:   "2026-04-01", to: "2026-04-05",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  check(Object.keys(q).length === 1,   "EC-12", "Only one date key (Apr 3)");
  check(hasItem(q["2026-04-03"],"addon","a1"), "EC-12", "Apr 3: addon present");
  check(!q["2026-04-01"],              "EC-12", "No subscription dates in output");
  check(!q["2026-04-05"],              "EC-12", "No subscription dates in output");
  check(q["2026-04-03"].every(i => i.type === "addon"), "EC-12", "No subscription items in any entry");
}

// ─── Edge Case 13 — Duplicate protection ─────────────────────────────────────

printSection(13, "Duplicate addon id protection");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"daily" as const },
    addons: [
      { id:"a1", type:"same_as_subscription" as const },
      { id:"a1", type:"same_as_subscription" as const }, // duplicate
    ],
    from: "2026-04-01", to: "2026-04-01",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  const addonItems = (q["2026-04-01"] ?? []).filter(i => i.id === "a1");
  check(addonItems.length === 1, "EC-13", "a1 appears exactly once (no duplicate)");
}

// ─── Edge Case 14 — Sorted output ────────────────────────────────────────────

printSection(14, "Output keys sorted ascending");
{
  // Alternate subscription → non-contiguous dates
  const input = {
    sub:    { id:"sub1", startDate:"2026-04-01", frequency:"alternate" as const },
    addons: [{ id:"a1", type:"one_time" as const, date:"2026-04-04" }],
    from:   "2026-04-01", to: "2026-04-07",
  };
  const q = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  printIO(input, q);

  const keys = Object.keys(q);
  const sorted = [...keys].sort();
  check(JSON.stringify(keys) === JSON.stringify(sorted), "EC-14", "Keys are in ascending order");
  check(keys[0] === "2026-04-01", "EC-14", "First key is earliest date");
}

// ─── Edge Case 15 — Large range performance ───────────────────────────────────

printSection(15, "Large range (1 year) — performance O(D)");
{
  const input = {
    sub:    { id:"sub1", startDate:"2026-01-01", frequency:"daily" as const },
    addons: [
      { id:"a1", type:"same_as_subscription" as const },
      { id:"a2", type:"recurring" as const, startDate:"2026-01-01",
        frequency:"weekly" as const, deliveryDays:[0,4] }, // Sun + Thu
    ],
    from: "2026-01-01", to: "2026-12-31",
  };

  const t0 = performance.now();
  const q  = buildDeliveryQueue(input.sub, input.addons, input.from, input.to);
  const ms = performance.now() - t0;

  const numDates = Object.keys(q).length;
  console.log(`     365-day range → ${numDates} dates generated in ${ms.toFixed(2)} ms`);

  check(numDates === 365,      "EC-15", "All 365 days present (daily sub)");
  check(ms < 100,              "EC-15", `Completed in ${ms.toFixed(2)} ms (threshold: 100 ms)`);
  check(hasItem(q["2026-01-01"],"subscription","sub1"), "EC-15", "Jan 1 has subscription");
  check(hasItem(q["2026-12-31"],"subscription","sub1"), "EC-15", "Dec 31 has subscription");

  // Sundays in Jan: Jan 4 = Sun (verify)
  check(hasItem(q["2026-01-04"],"addon","a2"), "EC-15", "Jan 4 (Sunday) has weekly addon");
  check(!hasItem(q["2026-01-02"],"addon","a2"), "EC-15", "Jan 2 (Friday) no weekly addon");
}

// ─── Final summary ────────────────────────────────────────────────────────────

const total = passed + failed;
console.log(`
════════════════════════════════════════════════════════
  EDGE CASE VALIDATION SUMMARY
════════════════════════════════════════════════════════
  Total assertions : ${total}
  Passed           : ${passed}
  Failed           : ${failed}
════════════════════════════════════════════════════════`);

if (failed === 0) {
  console.log("  ✓  ALL EDGE CASES PASS\n");
} else {
  console.log(`\n  FAILED ASSERTIONS:\n${failures.join("\n")}\n`);
  process.exitCode = 1;
}

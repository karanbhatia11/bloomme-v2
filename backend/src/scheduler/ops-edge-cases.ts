/**
 * buildDeliveryQueue — Operational Edge Case Validation
 * Run: npx ts-node src/scheduler/ops-edge-cases.ts
 */

import { buildDeliveryQueue, DeliveryQueue, DeliveryItem, Subscription, Addon } from "./buildDeliveryQueue";

// ─── Assertion framework ──────────────────────────────────────────────────────

interface TestResult { name: string; status: "PASS" | "FAIL"; reasons: string[] }
const results: TestResult[] = [];
let current: TestResult;

function startTest(name: string) {
  current = { name, status: "PASS", reasons: [] };
  results.push(current);
  console.log(`\n  ──────────────────────────────────────────────`);
  console.log(`  TEST: ${name}`);
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    current.status = "FAIL";
    current.reasons.push(msg);
    console.log(`    ✗  ${msg}`);
  } else {
    console.log(`    ✓  ${msg}`);
  }
}

function printQueue(q: DeliveryQueue) {
  for (const [date, items] of Object.entries(q)) {
    const row = items.map(i => `${i.type}(${i.id})`).join(", ");
    console.log(`    ${date}  →  [${row}]`);
  }
}

function has(items: DeliveryItem[] | undefined, type: DeliveryItem["type"], id: string) {
  return (items ?? []).some(x => x.type === type && x.id === id);
}
function pos(items: DeliveryItem[] | undefined, type: DeliveryItem["type"], id: string) {
  return (items ?? []).findIndex(x => x.type === type && x.id === id);
}

// ─── OPS-1: Same-day multi-item merge ────────────────────────────────────────

startTest("OPS-1 — Same-day multiple items must merge (not separate deliveries)");
{
  // 2026-04-05 is a Sunday
  const sub:    Subscription = { id:"flowers", startDate:"2026-04-01", frequency:"daily" };
  const addons: Addon[] = [
    { id:"agarbatti", type:"same_as_subscription" },
    { id:"ghee",      type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[0] },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-07");

  console.log("  Input: daily flowers + same_schedule agarbatti + weekly(Sun) ghee");
  console.log("  Output:");
  printQueue(q);

  assert(Object.keys(q).length === 7,                  "7 date keys (daily sub)");
  assert(has(q["2026-04-05"],"subscription","flowers"), "Sun Apr5: flowers present");
  assert(has(q["2026-04-05"],"addon","agarbatti"),      "Sun Apr5: agarbatti present");
  assert(has(q["2026-04-05"],"addon","ghee"),           "Sun Apr5: ghee present");
  assert(q["2026-04-05"].length === 3,                  "Sun Apr5: exactly 3 items (merged, not 3 separate deliveries)");
  assert(!has(q["2026-04-01"],"addon","ghee"),          "Mon Apr1: no ghee (not Sunday)");
  // Verify no duplicate date keys
  const sunKeys = Object.keys(q).filter(k => k === "2026-04-05");
  assert(sunKeys.length === 1,                          "No duplicate date keys for Sunday");
}

// ─── OPS-2: Addon frequency higher than subscription ─────────────────────────

startTest("OPS-2 — Addon frequency higher than subscription (daily addon, alternate sub)");
{
  const sub:    Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"alternate" };
  const addons: Addon[] = [
    { id:"a1", type:"recurring", startDate:"2026-04-01", frequency:"daily" },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-07");

  console.log("  Input: alternate sub + daily addon");
  console.log("  Output:");
  printQueue(q);

  // Sub: 1,3,5,7   Addon: 1,2,3,4,5,6,7
  assert(Object.keys(q).length === 7, "All 7 dates present (addon fills gaps)");
  // Sub+addon days
  for (const d of ["2026-04-01","2026-04-03","2026-04-05","2026-04-07"]) {
    assert(has(q[d],"subscription","sub1"), `${d}: sub present`);
    assert(has(q[d],"addon","a1"),          `${d}: addon present`);
  }
  // Addon-only days
  for (const d of ["2026-04-02","2026-04-04","2026-04-06"]) {
    assert(!has(q[d],"subscription","sub1"), `${d}: sub absent (gap day)`);
    assert( has(q[d],"addon","a1"),          `${d}: addon still delivers`);
  }
}

// ─── OPS-3: pauseDates — sub paused, independent addon unaffected ─────────────

startTest("OPS-3 — Subscription paused; independent recurring addon unaffected");
{
  // 2026-04-05 is Sunday
  const sub: Subscription = {
    id:"sub1", startDate:"2026-04-01", frequency:"daily",
    pauseDates: ["2026-04-03"],   // paused Thursday
  };
  const addons: Addon[] = [
    { id:"a1", type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[0] },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-07");

  console.log("  Input: daily sub pauseDates=[Apr3] + weekly(Sun) addon");
  console.log("  Output:");
  printQueue(q);

  assert( has(q["2026-04-01"],"subscription","sub1"),  "Apr1: sub delivers");
  assert( has(q["2026-04-02"],"subscription","sub1"),  "Apr2: sub delivers");
  assert(!has(q["2026-04-03"],"subscription","sub1"),  "Apr3: sub ABSENT (paused)");
  assert( has(q["2026-04-04"],"subscription","sub1"),  "Apr4: sub resumes");
  assert( has(q["2026-04-05"],"addon","a1"),            "Apr5(Sun): independent addon delivers");
  // Apr 3 may still appear if addon fires — in this case addon is weekly Sun so Apr3 has no entries
  assert(!q["2026-04-03"] || q["2026-04-03"].every(i => i.type !== "subscription"),
                                                        "Apr3: no subscription item in queue");
}

// ─── OPS-4: Multi-item packing list ──────────────────────────────────────────

startTest("OPS-4 — Same-address multi-item packing list [sub, a1, a2]");
{
  const sub:    Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"daily" };
  const addons: Addon[] = [
    { id:"a1", type:"same_as_subscription" },
    { id:"a2", type:"same_as_subscription" },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-01");

  console.log("  Input: daily sub + 2 same_schedule addons");
  console.log("  Output:");
  printQueue(q);

  const items = q["2026-04-01"];
  assert(items.length === 3,                          "Apr1: exactly 3 items (packing list)");
  assert(items[0].id === "sub1",                     "Position 0: subscription");
  assert(items[1].id === "a1",                       "Position 1: a1");
  assert(items[2].id === "a2",                       "Position 2: a2");
  assert(Object.keys(q).length === 1,                "Single date key (no duplicate keys)");
}

// ─── OPS-5: Addon after subscription ends ────────────────────────────────────

startTest("OPS-5 — Addon continues after subscription endDate");
{
  // Sub ends Apr 5. Next Sunday (Apr 5 AND Apr 12) — Apr 12 is outside range here.
  // Use range Apr 1 → Apr 12 so Apr 12 Sunday is reachable.
  const sub: Subscription = {
    id:"sub1", startDate:"2026-04-01", frequency:"daily",
    endDate: "2026-04-05",  // subscription stops Apr 5
  };
  const addons: Addon[] = [
    { id:"a1", type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[0] },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-12");

  console.log("  Input: daily sub endDate=Apr5 + weekly(Sun) addon in range Apr1-Apr12");
  console.log("  Output:");
  printQueue(q);

  assert( has(q["2026-04-01"],"subscription","sub1"), "Apr1: sub active");
  assert( has(q["2026-04-05"],"subscription","sub1"), "Apr5: sub last day (endDate inclusive)");
  assert(!has(q["2026-04-06"],"subscription","sub1"), "Apr6: sub absent (after endDate)");
  assert(!has(q["2026-04-07"],"subscription","sub1"), "Apr7: sub absent");
  // Apr 5 (Sunday) — sub + addon
  assert( has(q["2026-04-05"],"addon","a1"),          "Apr5(Sun): addon delivers with sub");
  // Apr 12 (Sunday) — addon only, sub has ended
  assert( has(q["2026-04-12"],"addon","a1"),          "Apr12(Sun): addon delivers after sub ends");
  assert(!has(q["2026-04-12"],"subscription","sub1"), "Apr12: sub absent (subscription ended)");
}

// ─── OPS-6: Large addon count ─────────────────────────────────────────────────

startTest("OPS-6 — Large addon count (10 addons → 11 items on one date)");
{
  const sub: Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"daily" };
  const addons: Addon[] = Array.from({ length: 10 }, (_, i) => ({
    id: `a${i+1}`,
    type: "same_as_subscription" as const,
  }));
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-01");

  console.log("  Input: 1 sub + 10 same_schedule addons");
  console.log("  Output:");
  printQueue(q);

  assert(q["2026-04-01"].length === 11, "Apr1: exactly 11 items (1 sub + 10 addons)");
  assert(q["2026-04-01"][0].id === "sub1", "Position 0: subscription");
  for (let i = 1; i <= 10; i++) {
    assert(q["2026-04-01"][i].id === `a${i}`, `Position ${i}: addon a${i}`);
  }
}

// ─── OPS-7: Delivery gap compression ─────────────────────────────────────────

startTest("OPS-7 — No empty dates in output (gap dates omitted entirely)");
{
  // Alternate sub: 1,3,5,7  |  weekly Mon addon: Apr 6
  const sub: Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"alternate" };
  const addons: Addon[] = [
    { id:"a1", type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[1] }, // Mon
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-07");

  console.log("  Input: alternate sub + weekly(Mon) addon");
  console.log("  Output:");
  printQueue(q);

  const keys = Object.keys(q);
  // Apr1(sub),Apr3(sub),Apr5(sub),Apr6(addon Mon),Apr7(sub) — Apr2,4 absent
  assert(!q["2026-04-02"], "Apr2: absent (gap day, no items)");
  assert(!q["2026-04-04"], "Apr4: absent (gap day, no items)");
  assert( q["2026-04-01"] !== undefined, "Apr1: present (sub)");
  assert( q["2026-04-06"] !== undefined, "Apr6(Mon): present (addon)");
  // All entries have at least one item
  const allNonEmpty = keys.every(k => q[k].length > 0);
  assert(allNonEmpty, "Every date key has ≥1 item (no empty arrays)");
}

// ─── OPS-8: Multiple schedules collide ───────────────────────────────────────

startTest("OPS-8 — Sub weekly Mon + addon weekly Mon → merged, not duplicate key");
{
  // 2026-04-06 is Monday
  const sub: Subscription = {
    id:"sub1", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[1]
  };
  const addons: Addon[] = [
    { id:"a1", type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[1] },
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-07");

  console.log("  Input: weekly(Mon) sub + weekly(Mon) addon");
  console.log("  Output:");
  printQueue(q);

  // Only Monday in range Apr1-Apr7 is Apr 6
  assert(Object.keys(q).length === 1,              "Exactly 1 date key (Monday only)");
  assert(Object.keys(q)[0] === "2026-04-06",       "Date key is Apr 6 (Monday)");
  assert(q["2026-04-06"].length === 2,             "Apr6: exactly 2 items (no duplicate key, no duplicate items)");
  assert(has(q["2026-04-06"],"subscription","sub1"), "Apr6: sub present");
  assert(has(q["2026-04-06"],"addon","a1"),          "Apr6: addon present");
  const monKeys = Object.keys(q).filter(k => k === "2026-04-06");
  assert(monKeys.length === 1,                     "No duplicate keys for Monday");
}

// ─── OPS-9: One-time same day as multiple ────────────────────────────────────

startTest("OPS-9 — One-time + same_schedule + weekly all on same day → single merged array");
{
  // 2026-04-03 is Friday (dow=5)
  const sub: Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"daily" };
  const addons: Addon[] = [
    { id:"a_same", type:"same_as_subscription" },
    { id:"a_once", type:"one_time", date:"2026-04-03" },
    { id:"a_week", type:"recurring", startDate:"2026-04-01", frequency:"weekly", deliveryDays:[5] }, // Friday
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-05");

  console.log("  Input: daily sub + same_schedule + one_time(Apr3) + weekly(Fri)");
  console.log("  Output:");
  printQueue(q);

  const items = q["2026-04-03"];
  assert(items.length === 4,                          "Apr3: exactly 4 items in single array");
  assert(has(items,"subscription","sub1"),            "Apr3: sub present");
  assert(has(items,"addon","a_same"),                 "Apr3: a_same present");
  assert(has(items,"addon","a_once"),                 "Apr3: a_once (one_time) present");
  assert(has(items,"addon","a_week"),                 "Apr3: a_week (weekly Fri) present");
  // All under ONE date key
  const apr3Keys = Object.keys(q).filter(k => k === "2026-04-03");
  assert(apr3Keys.length === 1,                       "Single date key for Apr 3");
}

// ─── OPS-10: Deterministic type-priority ordering ────────────────────────────

startTest("OPS-10 — Deterministic ordering: sub → same_as_sub → recurring → one_time");
{
  // Deliberately pass addons in REVERSE type order to prove sorting works
  const sub: Subscription = { id:"sub1", startDate:"2026-04-01", frequency:"daily" };
  const addons: Addon[] = [
    { id:"a_once", type:"one_time",             date:"2026-04-01" },               // priority 2
    { id:"a_recv", type:"recurring",            startDate:"2026-04-01", frequency:"daily" }, // priority 1
    { id:"a_same", type:"same_as_subscription" },                                 // priority 0
  ];
  const q = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-01");

  console.log("  Input: addons passed in REVERSE type order (one_time, recurring, same_as_sub)");
  console.log("  Output:");
  printQueue(q);

  const items = q["2026-04-01"];
  assert(items.length === 4,                        "4 items total");
  assert(items[0].id === "sub1",                   "Position 0: subscription (always first)");
  assert(items[1].id === "a_same",                 "Position 1: same_as_subscription (priority 0)");
  assert(items[2].id === "a_recv",                 "Position 2: recurring (priority 1)");
  assert(items[3].id === "a_once",                 "Position 3: one_time (priority 2)");

  // Run again to confirm determinism
  const q2 = buildDeliveryQueue(sub, addons, "2026-04-01", "2026-04-01");
  assert(JSON.stringify(q) === JSON.stringify(q2), "Deterministic: identical result on repeated calls");
}

// ─── Previous edge cases still pass (regression) ─────────────────────────────

startTest("REGRESSION — Previously passing EC tests still pass");
{
  // EC-4 skipDates
  {
    const q = buildDeliveryQueue(
      { id:"s", startDate:"2026-04-01", frequency:"daily", skipDates:["2026-04-03"] },
      [], "2026-04-01", "2026-04-04"
    );
    assert(!q["2026-04-03"], "EC-4 skipDates still works");
  }
  // EC-12 null subscription
  {
    const q = buildDeliveryQueue(null,
      [{ id:"a1", type:"one_time", date:"2026-04-03" }],
      "2026-04-01", "2026-04-05"
    );
    assert(has(q["2026-04-03"],"addon","a1"), "EC-12 null sub still works");
    assert(Object.keys(q).length === 1,      "EC-12 no phantom subscription dates");
  }
  // EC-13 dedup
  {
    const q = buildDeliveryQueue(
      { id:"s", startDate:"2026-04-01", frequency:"daily" },
      [{ id:"x", type:"same_as_subscription" },{ id:"x", type:"same_as_subscription" }],
      "2026-04-01","2026-04-01"
    );
    assert(q["2026-04-01"].filter(i=>i.id==="x").length === 1, "EC-13 dedup still works");
  }
}

// ─── Summary table ────────────────────────────────────────────────────────────

console.log(`
════════════════════════════════════════════════════════════
  OPERATIONAL EDGE CASE — RESULTS
════════════════════════════════════════════════════════════
  ${"TEST".padEnd(60)} STATUS
  ${"────".padEnd(60)} ──────`);

let totalPass = 0, totalFail = 0;
for (const r of results) {
  const status = r.status === "PASS" ? "✓ PASS" : "✗ FAIL";
  console.log(`  ${r.name.padEnd(60)} ${status}`);
  if (r.status === "FAIL") {
    for (const reason of r.reasons) console.log(`      → ${reason}`);
    totalFail++;
  } else {
    totalPass++;
  }
}

console.log(`
════════════════════════════════════════════════════════════
  Total tests  : ${results.length}
  Passed       : ${totalPass}
  Failed       : ${totalFail}
════════════════════════════════════════════════════════════`);

if (totalFail === 0) console.log("  ✓  ALL OPERATIONAL EDGE CASES PASS\n");
else { console.log("  ✗  SOME TESTS FAILED\n"); process.exitCode = 1; }

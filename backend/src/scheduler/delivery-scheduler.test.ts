/**
 * Delivery Scheduler — Test Suite
 *
 * Covers:
 *  1. Date utilities (unit)
 *  2. generateSubscriptionDates — all frequencies
 *  3. generateAddonDates — all types
 *  4. mergeDeliveryQueue
 *  5. buildDeliveryQueue (integration)
 *  6. Edge cases
 *  7. Error handling
 */

import {
  buildDeliveryQueue,
  generateSubscriptionDates,
  generateAddonDates,
  mergeDeliveryQueue,
  buildDeliveryQueues,
  Subscription,
  Addon,
  DateRange,
  DeliveryQueue,
  Frequency,
  _internal,
} from "./delivery-scheduler";

const { parseDate, dateToDayNumber, dayNumberToDate, getDayOfWeek, isLeapYear } = _internal;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract just the date strings from a queue */
const queueDates = (q: DeliveryQueue) => Object.keys(q);

/** Count total items across all dates */
const totalItems = (q: DeliveryQueue) =>
  Object.values(q).reduce((s, items) => s + items.length, 0);

/** All items on a specific date */
const itemsOn = (q: DeliveryQueue, date: string) => q[date] ?? [];

// ─── 1. Date utility unit tests ───────────────────────────────────────────────

describe("_internal.isLeapYear", () => {
  test("2000 is a leap year", () => expect(isLeapYear(2000)).toBe(true));
  test("1900 is NOT a leap year", () => expect(isLeapYear(1900)).toBe(false));
  test("2024 is a leap year", () => expect(isLeapYear(2024)).toBe(true));
  test("2026 is NOT a leap year", () => expect(isLeapYear(2026)).toBe(false));
  test("2100 is NOT a leap year", () => expect(isLeapYear(2100)).toBe(false));
});

describe("_internal.dateToDayNumber / dayNumberToDate", () => {
  test("epoch: 2000-01-01 = 0", () => {
    expect(dateToDayNumber("2000-01-01")).toBe(0);
    expect(dayNumberToDate(0)).toBe("2000-01-01");
  });

  test("2000-01-02 = 1", () => {
    expect(dateToDayNumber("2000-01-02")).toBe(1);
    expect(dayNumberToDate(1)).toBe("2000-01-02");
  });

  test("round-trip for 2026-04-01", () => {
    const n = dateToDayNumber("2026-04-01");
    expect(dayNumberToDate(n)).toBe("2026-04-01");
  });

  test("round-trip for leap day 2024-02-29", () => {
    const n = dateToDayNumber("2024-02-29");
    expect(dayNumberToDate(n)).toBe("2024-02-29");
  });

  test("consecutive dates differ by 1", () => {
    const a = dateToDayNumber("2026-03-31");
    const b = dateToDayNumber("2026-04-01");
    expect(b - a).toBe(1);
  });

  test("2026 year boundary", () => {
    const dec31 = dateToDayNumber("2025-12-31");
    const jan1  = dateToDayNumber("2026-01-01");
    expect(jan1 - dec31).toBe(1);
  });
});

describe("_internal.getDayOfWeek", () => {
  // 2026-04-01 is a Wednesday (verified independently)
  test("2026-04-01 is Wednesday (3)", () => expect(getDayOfWeek("2026-04-01")).toBe(3));
  test("2026-04-05 is Sunday (0)",    () => expect(getDayOfWeek("2026-04-05")).toBe(0));
  test("2026-04-06 is Monday (1)",    () => expect(getDayOfWeek("2026-04-06")).toBe(1));
  test("2026-04-04 is Saturday (6)",  () => expect(getDayOfWeek("2026-04-04")).toBe(6));
  test("2000-01-01 is Saturday (6)",  () => expect(getDayOfWeek("2000-01-01")).toBe(6));
  test("2024-02-29 is Thursday (4)",  () => expect(getDayOfWeek("2024-02-29")).toBe(4));
});

describe("_internal.parseDate", () => {
  test("throws on non-string", () =>
    expect(() => parseDate(null as any)).toThrow());
  test("throws on wrong format", () =>
    expect(() => parseDate("01-04-2026")).toThrow());
  test("throws on month 13", () =>
    expect(() => parseDate("2026-13-01")).toThrow());
  test("throws on Feb 30", () =>
    expect(() => parseDate("2026-02-30")).toThrow());
  test("accepts Feb 29 on leap year", () =>
    expect(() => parseDate("2024-02-29")).not.toThrow());
  test("throws Feb 29 on non-leap year", () =>
    expect(() => parseDate("2026-02-29")).toThrow());
});

// ─── 2. generateSubscriptionDates ─────────────────────────────────────────────

describe("generateSubscriptionDates — daily", () => {
  const sub: Subscription = {
    id: "sub_1",
    startDate: "2026-04-01",
    frequency: "daily",
  };
  const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };

  test("generates 7 dates for a 7-day range", () => {
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.size).toBe(7);
  });

  test("all dates fall within range", () => {
    const dates = generateSubscriptionDates(sub, range);
    for (const d of dates) {
      expect(d >= "2026-04-01" && d <= "2026-04-07").toBe(true);
    }
  });

  test("respects skipDates", () => {
    const dates = generateSubscriptionDates(
      { ...sub, skipDates: ["2026-04-03"] },
      range
    );
    expect(dates.has("2026-04-03")).toBe(false);
    expect(dates.size).toBe(6);
  });

  test("respects pauseDates", () => {
    const dates = generateSubscriptionDates(
      { ...sub, pauseDates: ["2026-04-02", "2026-04-04"] },
      range
    );
    expect(dates.has("2026-04-02")).toBe(false);
    expect(dates.has("2026-04-04")).toBe(false);
    expect(dates.size).toBe(5);
  });

  test("skip + pause combined", () => {
    const dates = generateSubscriptionDates(
      { ...sub, skipDates: ["2026-04-01"], pauseDates: ["2026-04-07"] },
      range
    );
    expect(dates.size).toBe(5);
  });
});

describe("generateSubscriptionDates — alternate", () => {
  const sub: Subscription = {
    id: "sub_alt",
    startDate: "2026-04-01",
    frequency: "alternate",
  };

  test("delivers on days 1, 3, 5, 7 of a 7-day range (0-indexed offsets 0,2,4,6)", () => {
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const dates = generateSubscriptionDates(sub, range);
    // offset 0: Apr 1 ✓  offset 2: Apr 3 ✓  offset 4: Apr 5 ✓  offset 6: Apr 7 ✓
    expect(dates.size).toBe(4);
    expect(dates.has("2026-04-01")).toBe(true);
    expect(dates.has("2026-04-02")).toBe(false);
    expect(dates.has("2026-04-03")).toBe(true);
    expect(dates.has("2026-04-05")).toBe(true);
    expect(dates.has("2026-04-07")).toBe(true);
  });

  test("respects cycle anchor when range starts mid-cycle", () => {
    // Sub starts Apr 1 (offset 0 = deliver, offset 1 = skip, offset 2 = deliver...)
    // Range from Apr 2 (offset 1 = skip, offset 2 = deliver Apr 3)
    const range: DateRange = { from: "2026-04-02", to: "2026-04-05" };
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.has("2026-04-02")).toBe(false); // offset 1
    expect(dates.has("2026-04-03")).toBe(true);  // offset 2
    expect(dates.has("2026-04-04")).toBe(false); // offset 3
    expect(dates.has("2026-04-05")).toBe(true);  // offset 4
  });
});

describe("generateSubscriptionDates — weekly", () => {
  const sub: Subscription = {
    id: "sub_weekly",
    startDate: "2026-04-01",
    frequency: "weekly",
    deliveryDays: [0, 3], // Sunday and Wednesday
  };
  const range: DateRange = { from: "2026-04-01", to: "2026-04-14" };

  test("delivers only on specified days of week", () => {
    const dates = generateSubscriptionDates(sub, range);
    // Apr 1=Wed(3) ✓, Apr 5=Sun(0) ✓, Apr 8=Wed(3) ✓, Apr 12=Sun(0) ✓
    expect(dates.size).toBe(4);
    expect(dates.has("2026-04-01")).toBe(true);  // Wednesday
    expect(dates.has("2026-04-05")).toBe(true);  // Sunday
    expect(dates.has("2026-04-08")).toBe(true);  // Wednesday
    expect(dates.has("2026-04-12")).toBe(true);  // Sunday
    expect(dates.has("2026-04-02")).toBe(false); // Thursday
    expect(dates.has("2026-04-06")).toBe(false); // Monday
  });
});

describe("generateSubscriptionDates — boundary conditions", () => {
  test("startDate after range.to returns empty set", () => {
    const sub: Subscription = {
      id: "sub_future",
      startDate: "2026-05-01",
      frequency: "daily",
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-30" };
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.size).toBe(0);
  });

  test("startDate before range.from clamps to range start", () => {
    const sub: Subscription = {
      id: "sub_old",
      startDate: "2026-01-01",
      frequency: "daily",
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-03" };
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.size).toBe(3);
    expect(dates.has("2026-04-01")).toBe(true);
  });

  test("single-day range", () => {
    const sub: Subscription = {
      id: "sub_single",
      startDate: "2026-04-05",
      frequency: "daily",
    };
    const range: DateRange = { from: "2026-04-05", to: "2026-04-05" };
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.size).toBe(1);
    expect(dates.has("2026-04-05")).toBe(true);
  });

  test("all dates skipped returns empty set", () => {
    const sub: Subscription = {
      id: "sub_skip_all",
      startDate: "2026-04-01",
      frequency: "daily",
      skipDates: ["2026-04-01", "2026-04-02", "2026-04-03"],
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-03" };
    const dates = generateSubscriptionDates(sub, range);
    expect(dates.size).toBe(0);
  });
});

// ─── 3. generateAddonDates ────────────────────────────────────────────────────

describe("generateAddonDates — same_as_subscription", () => {
  const subscriptionDates = new Set(["2026-04-01", "2026-04-03", "2026-04-05"]);

  test("returns exact copy of subscription dates", () => {
    const addon: Addon = { id: "addon_same", type: "same_as_subscription" };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates).toEqual(subscriptionDates);
  });

  test("does NOT return the same Set reference (no mutation risk)", () => {
    const addon: Addon = { id: "addon_same", type: "same_as_subscription" };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates).not.toBe(subscriptionDates);
  });
});

describe("generateAddonDates — recurring", () => {
  const subscriptionDates = new Set<string>();

  test("weekly on Sundays", () => {
    const addon: Addon = {
      id: "addon_weekly_sun",
      type: "recurring",
      startDate: "2026-04-01",
      frequency: "weekly",
      deliveryDays: [0], // Sunday
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    // 2026-04-05 is Sunday
    expect(dates.size).toBe(1);
    expect(dates.has("2026-04-05")).toBe(true);
  });

  test("alternate days independent of subscription", () => {
    const addon: Addon = {
      id: "addon_alt",
      type: "recurring",
      startDate: "2026-04-02", // starts on Apr 2 (odd offset from Apr 1)
      frequency: "alternate",
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    // Anchor = Apr 2. Delivers: Apr 2 (offset 0), Apr 4 (offset 2), Apr 6 (offset 4)
    expect(dates.has("2026-04-02")).toBe(true);
    expect(dates.has("2026-04-04")).toBe(true);
    expect(dates.has("2026-04-06")).toBe(true);
    expect(dates.has("2026-04-01")).toBe(false);
    expect(dates.size).toBe(3);
  });
});

describe("generateAddonDates — one_time", () => {
  const subscriptionDates = new Set<string>();
  const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };

  test("delivers on the specified date if in range", () => {
    const addon: Addon = { id: "addon_once", type: "one_time", startDate: "2026-04-04" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(1);
    expect(dates.has("2026-04-04")).toBe(true);
  });

  test("excluded if date is before range.from", () => {
    const addon: Addon = { id: "addon_once", type: "one_time", startDate: "2026-03-28" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(0);
  });

  test("excluded if date is after range.to", () => {
    const addon: Addon = { id: "addon_once", type: "one_time", startDate: "2026-04-15" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(0);
  });

  test("included on range boundary (range.from)", () => {
    const addon: Addon = { id: "addon_once", type: "one_time", startDate: "2026-04-01" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(1);
  });

  test("included on range boundary (range.to)", () => {
    const addon: Addon = { id: "addon_once", type: "one_time", startDate: "2026-04-07" };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(1);
  });
});

describe("generateAddonDates — custom", () => {
  const subscriptionDates = new Set<string>();
  const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };

  test("includes only dates within range", () => {
    const addon: Addon = {
      id: "addon_custom",
      type: "custom",
      customDates: ["2026-03-30", "2026-04-03", "2026-04-06", "2026-04-10"],
    };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(2);
    expect(dates.has("2026-04-03")).toBe(true);
    expect(dates.has("2026-04-06")).toBe(true);
    expect(dates.has("2026-03-30")).toBe(false);
    expect(dates.has("2026-04-10")).toBe(false);
  });

  test("deduplicates repeated custom dates", () => {
    const addon: Addon = {
      id: "addon_custom_dup",
      type: "custom",
      customDates: ["2026-04-05", "2026-04-05", "2026-04-05"],
    };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(1);
  });

  test("all customDates outside range → empty", () => {
    const addon: Addon = {
      id: "addon_outside",
      type: "custom",
      customDates: ["2026-03-01", "2026-05-01"],
    };
    const dates = generateAddonDates(addon, subscriptionDates, range);
    expect(dates.size).toBe(0);
  });
});

// ─── 4. mergeDeliveryQueue ────────────────────────────────────────────────────

describe("mergeDeliveryQueue", () => {
  test("subscription-only delivery", () => {
    const subDates = new Set(["2026-04-01", "2026-04-02"]);
    const queue = mergeDeliveryQueue("sub_1", subDates, []);
    expect(queueDates(queue)).toEqual(["2026-04-01", "2026-04-02"]);
    expect(itemsOn(queue, "2026-04-01")).toEqual([{ type: "subscription", id: "sub_1" }]);
  });

  test("subscription + addon on same day merges correctly", () => {
    const subDates = new Set(["2026-04-01"]);
    const addonMaps = [{ addonId: "addon_1", dates: new Set(["2026-04-01"]) }];
    const queue = mergeDeliveryQueue("sub_1", subDates, addonMaps);
    const items = itemsOn(queue, "2026-04-01");
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ type: "subscription", id: "sub_1" });
    expect(items[1]).toEqual({ type: "addon", id: "addon_1" });
  });

  test("addon-only date (subscription not delivering that day)", () => {
    const subDates = new Set(["2026-04-01"]);
    const addonMaps = [{ addonId: "addon_1", dates: new Set(["2026-04-02"]) }];
    const queue = mergeDeliveryQueue("sub_1", subDates, addonMaps);
    expect(queueDates(queue)).toContain("2026-04-02");
    expect(itemsOn(queue, "2026-04-02")).toEqual([{ type: "addon", id: "addon_1" }]);
  });

  test("output dates are sorted ascending", () => {
    const subDates = new Set(["2026-04-05", "2026-04-01", "2026-04-03"]);
    const queue = mergeDeliveryQueue("sub_1", subDates, []);
    expect(queueDates(queue)).toEqual(["2026-04-01", "2026-04-03", "2026-04-05"]);
  });

  test("multiple addons on same day preserve order", () => {
    const subDates = new Set(["2026-04-01"]);
    const addonMaps = [
      { addonId: "addon_a", dates: new Set(["2026-04-01"]) },
      { addonId: "addon_b", dates: new Set(["2026-04-01"]) },
      { addonId: "addon_c", dates: new Set(["2026-04-01"]) },
    ];
    const queue = mergeDeliveryQueue("sub_1", subDates, addonMaps);
    const items = itemsOn(queue, "2026-04-01");
    expect(items.map((i) => i.id)).toEqual(["sub_1", "addon_a", "addon_b", "addon_c"]);
  });

  test("no date appears in queue if it has zero items", () => {
    const queue = mergeDeliveryQueue("sub_1", new Set(), []);
    expect(Object.keys(queue)).toHaveLength(0);
  });
});

// ─── 5. buildDeliveryQueue — integration ─────────────────────────────────────

describe("buildDeliveryQueue — example from spec", () => {
  const subscription: Subscription = {
    id: "sub_1",
    startDate: "2026-04-01",
    frequency: "daily",
  };

  const addons: Addon[] = [
    { id: "addon_1", type: "same_as_subscription" },
    {
      id: "addon_2",
      type: "recurring",
      startDate: "2026-04-01",
      frequency: "weekly",
      deliveryDays: [0], // Sunday
    },
  ];

  const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };

  let queue: DeliveryQueue;
  beforeAll(() => { queue = buildDeliveryQueue(subscription, addons, range); });

  test("has entries for all 7 days", () => {
    expect(queueDates(queue)).toHaveLength(7);
  });

  test("Apr 1–4 and Apr 6–7: subscription + addon_1 only", () => {
    for (const date of ["2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-06", "2026-04-07"]) {
      const ids = itemsOn(queue, date).map((i) => i.id);
      expect(ids).toEqual(["sub_1", "addon_1"]);
    }
  });

  test("Apr 5 (Sunday): subscription + addon_1 + addon_2", () => {
    const ids = itemsOn(queue, "2026-04-05").map((i) => i.id);
    expect(ids).toEqual(["sub_1", "addon_1", "addon_2"]);
  });

  test("output matches spec exactly", () => {
    expect(queue).toEqual({
      "2026-04-01": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
      "2026-04-02": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
      "2026-04-03": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
      "2026-04-04": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
      "2026-04-05": [
        { type: "subscription", id: "sub_1" },
        { type: "addon", id: "addon_1" },
        { type: "addon", id: "addon_2" },
      ],
      "2026-04-06": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
      "2026-04-07": [{ type: "subscription", id: "sub_1" }, { type: "addon", id: "addon_1" }],
    });
  });
});

describe("buildDeliveryQueue — all addon types combined", () => {
  const subscription: Subscription = {
    id: "sub_1",
    startDate: "2026-04-01",
    frequency: "alternate", // Apr 1, 3, 5, 7
  };

  const addons: Addon[] = [
    { id: "same", type: "same_as_subscription" },                     // Apr 1, 3, 5, 7
    { id: "once", type: "one_time", startDate: "2026-04-02" },        // Apr 2 only
    { id: "cust", type: "custom",   customDates: ["2026-04-04", "2026-04-06"] },
    {
      id: "recv", type: "recurring",
      startDate: "2026-04-01", frequency: "weekly", deliveryDays: [5], // Friday = Apr 3
    },
  ];

  const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
  let queue: DeliveryQueue;
  beforeAll(() => { queue = buildDeliveryQueue(subscription, addons, range); });

  test("Apr 1: sub + same", () => {
    const ids = itemsOn(queue, "2026-04-01").map((i) => i.id);
    expect(ids).toContain("sub_1");
    expect(ids).toContain("same");
    expect(ids).not.toContain("once");
  });

  test("Apr 2: once addon only (sub doesn't deliver on alternate day)", () => {
    const ids = itemsOn(queue, "2026-04-02").map((i) => i.id);
    expect(ids).toEqual(["once"]);
  });

  test("Apr 3 (Friday): sub + same + recurring weekly", () => {
    const ids = itemsOn(queue, "2026-04-03").map((i) => i.id);
    expect(ids).toContain("sub_1");
    expect(ids).toContain("same");
    expect(ids).toContain("recv");
  });

  test("Apr 4: custom addon only", () => {
    const ids = itemsOn(queue, "2026-04-04").map((i) => i.id);
    expect(ids).toEqual(["cust"]);
  });

  test("Apr 6: custom addon only", () => {
    const ids = itemsOn(queue, "2026-04-06").map((i) => i.id);
    expect(ids).toEqual(["cust"]);
  });

  test("covers all 7 dates", () => {
    expect(queueDates(queue)).toHaveLength(7);
  });
});

// ─── 6. Edge case tests ───────────────────────────────────────────────────────

describe("Edge cases", () => {
  test("empty addons array", () => {
    const sub: Subscription = { id: "sub_1", startDate: "2026-04-01", frequency: "daily" };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-03" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toHaveLength(3);
    expect(itemsOn(queue, "2026-04-01")).toEqual([{ type: "subscription", id: "sub_1" }]);
  });

  test("subscription entirely paused for range", () => {
    const sub: Subscription = {
      id: "sub_paused",
      startDate: "2026-04-01",
      frequency: "daily",
      pauseDates: ["2026-04-01", "2026-04-02", "2026-04-03"],
    };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-03" };
    const addons: Addon[] = [{ id: "same", type: "same_as_subscription" }];
    const queue = buildDeliveryQueue(sub, addons, range);
    // Both subscription and same_as_subscription should be empty
    expect(Object.keys(queue)).toHaveLength(0);
  });

  test("one_time addon with subscription that has no deliveries on that day still appears", () => {
    const sub: Subscription = {
      id: "sub_weekly",
      startDate: "2026-04-01",
      frequency: "weekly",
      deliveryDays: [1], // Monday only
    };
    const addons: Addon[] = [
      { id: "once_wed", type: "one_time", startDate: "2026-04-01" }, // Wednesday
    ];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const queue = buildDeliveryQueue(sub, addons, range);
    // Apr 1 (Wed) should appear with just the addon
    expect(itemsOn(queue, "2026-04-01").map((i) => i.id)).toEqual(["once_wed"]);
    // Apr 6 (Mon) should appear with just the subscription
    expect(itemsOn(queue, "2026-04-06").map((i) => i.id)).toEqual(["sub_weekly"]);
  });

  test("leap year: Feb 29 2024 is generated by daily subscription", () => {
    const sub: Subscription = { id: "sub_leap", startDate: "2024-02-28", frequency: "daily" };
    const range: DateRange = { from: "2024-02-28", to: "2024-03-01" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toEqual(["2024-02-28", "2024-02-29", "2024-03-01"]);
  });

  test("non-leap year: Feb 29 does not exist; Feb 28 → Mar 1 correctly", () => {
    const sub: Subscription = { id: "sub_nonleap", startDate: "2026-02-28", frequency: "daily" };
    const range: DateRange = { from: "2026-02-28", to: "2026-03-01" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toEqual(["2026-02-28", "2026-03-01"]);
    expect(queueDates(queue)).not.toContain("2026-02-29");
  });

  test("year boundary: Dec 31 → Jan 1 handled correctly", () => {
    const sub: Subscription = { id: "sub_yr", startDate: "2025-12-30", frequency: "daily" };
    const range: DateRange = { from: "2025-12-30", to: "2026-01-02" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toEqual([
      "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
    ]);
  });

  test("range.from === range.to (single day)", () => {
    const sub: Subscription = { id: "sub_1", startDate: "2026-04-05", frequency: "daily" };
    const range: DateRange = { from: "2026-04-05", to: "2026-04-05" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toEqual(["2026-04-05"]);
  });

  test("subscription startDate == range.to (last possible day)", () => {
    const sub: Subscription = { id: "sub_1", startDate: "2026-04-07", frequency: "daily" };
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const queue = buildDeliveryQueue(sub, [], range);
    expect(queueDates(queue)).toEqual(["2026-04-07"]);
  });

  test("custom addon with all dates outside range produces no entries from that addon", () => {
    const sub: Subscription = { id: "sub_1", startDate: "2026-04-01", frequency: "daily" };
    const addons: Addon[] = [{
      id: "out_of_range",
      type: "custom",
      customDates: ["2026-05-01", "2026-06-01"],
    }];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-03" };
    const queue = buildDeliveryQueue(sub, addons, range);
    for (const date of queueDates(queue)) {
      expect(itemsOn(queue, date).map((i) => i.id)).not.toContain("out_of_range");
    }
  });

  test("same_as_subscription with zero subscription dates → addon also empty", () => {
    const sub: Subscription = {
      id: "sub_future",
      startDate: "2026-05-01", // starts after range
      frequency: "daily",
    };
    const addons: Addon[] = [{ id: "same", type: "same_as_subscription" }];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-07" };
    const queue = buildDeliveryQueue(sub, addons, range);
    expect(Object.keys(queue)).toHaveLength(0);
  });

  test("deterministic: calling twice returns identical output", () => {
    const sub: Subscription = { id: "sub_1", startDate: "2026-04-01", frequency: "daily" };
    const addons: Addon[] = [
      { id: "addon_1", type: "same_as_subscription" },
      { id: "addon_2", type: "one_time", startDate: "2026-04-03" },
    ];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-05" };
    const q1 = buildDeliveryQueue(sub, addons, range);
    const q2 = buildDeliveryQueue(sub, addons, range);
    expect(JSON.stringify(q1)).toBe(JSON.stringify(q2));
  });

  test("inputs are not mutated by the engine", () => {
    const sub: Subscription = {
      id: "sub_1",
      startDate: "2026-04-01",
      frequency: "daily",
      skipDates: ["2026-04-03"],
    };
    const addons: Addon[] = [{ id: "addon_1", type: "same_as_subscription" }];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-05" };

    // Deep-clone to check for mutation
    const subBefore  = JSON.stringify(sub);
    const addonsBefore = JSON.stringify(addons);
    const rangeBefore  = JSON.stringify(range);

    buildDeliveryQueue(sub, addons, range);

    expect(JSON.stringify(sub)).toBe(subBefore);
    expect(JSON.stringify(addons)).toBe(addonsBefore);
    expect(JSON.stringify(range)).toBe(rangeBefore);
  });
});

// ─── 7. Error handling tests ──────────────────────────────────────────────────

describe("Error handling", () => {
  const validRange: DateRange = { from: "2026-04-01", to: "2026-04-07" };

  test("throws on invalid subscription frequency", () => {
    const sub = { id: "s1", startDate: "2026-04-01", frequency: "hourly" } as any;
    expect(() => buildDeliveryQueue(sub, [], validRange)).toThrow(/invalid frequency/i);
  });

  test("throws on weekly subscription without deliveryDays", () => {
    const sub: Subscription = { id: "s1", startDate: "2026-04-01", frequency: "weekly" };
    expect(() => buildDeliveryQueue(sub, [], validRange)).toThrow(/deliveryDays/i);
  });

  test("throws on range.from > range.to", () => {
    const sub: Subscription = { id: "s1", startDate: "2026-04-01", frequency: "daily" };
    expect(() =>
      buildDeliveryQueue(sub, [], { from: "2026-04-07", to: "2026-04-01" })
    ).toThrow();
  });

  test("throws on malformed date string", () => {
    const sub: Subscription = { id: "s1", startDate: "01/04/2026", frequency: "daily" };
    expect(() => buildDeliveryQueue(sub, [], validRange)).toThrow(/invalid date/i);
  });

  test("throws on addon recurring without startDate", () => {
    const sub: Subscription = { id: "s1", startDate: "2026-04-01", frequency: "daily" };
    const addon = { id: "a1", type: "recurring", frequency: "daily" } as any;
    expect(() => buildDeliveryQueue(sub, [addon], validRange)).toThrow(/startDate/i);
  });

  test("throws on addon custom without customDates", () => {
    const sub: Subscription = { id: "s1", startDate: "2026-04-01", frequency: "daily" };
    const addon = { id: "a1", type: "custom" } as any;
    expect(() => buildDeliveryQueue(sub, [addon], validRange)).toThrow(/customDates/i);
  });

  test("throws on missing subscription id", () => {
    const sub = { startDate: "2026-04-01", frequency: "daily" } as any;
    expect(() => buildDeliveryQueue(sub, [], validRange)).toThrow(/id/i);
  });

  test("throws on invalid date: Feb 30", () => {
    const sub: Subscription = { id: "s1", startDate: "2026-02-30", frequency: "daily" };
    expect(() => buildDeliveryQueue(sub, [], validRange)).toThrow();
  });
});

// ─── 8. Batch helper test ─────────────────────────────────────────────────────

describe("buildDeliveryQueues (batch)", () => {
  test("processes multiple subscriptions independently", () => {
    const jobs = [
      {
        subscription: { id: "sub_a", startDate: "2026-04-01", frequency: "daily" as Frequency },
        addons: [],
      },
      {
        subscription: { id: "sub_b", startDate: "2026-04-03", frequency: "daily" as Frequency },
        addons: [],
      },
    ];
    const range: DateRange = { from: "2026-04-01", to: "2026-04-05" };
    const result = buildDeliveryQueues(jobs, range);

    expect(result.size).toBe(2);
    // sub_a delivers all 5 days
    expect(queueDates(result.get("sub_a")!)).toHaveLength(5);
    // sub_b starts Apr 3 → 3 days
    expect(queueDates(result.get("sub_b")!)).toHaveLength(3);
  });
});

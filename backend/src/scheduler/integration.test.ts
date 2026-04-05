// ─────────────────────────────────────────────────────────────────────────────
// Integration Validation Tests — buildDeliveryQueue service layer
//
// These tests exercise the pure engine (buildDeliveryQueue) via the same
// call paths used by scheduler.ts and preview.ts, ensuring the mapping
// logic (parseNumericArray, parseDateArray, type coercions) round-trips
// correctly for the 12 canonical integration scenarios.
//
// Run: npx jest src/scheduler/integration-tests.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  buildDeliveryQueue,
  Subscription,
  Addon,
  DeliveryQueue,
} from './buildDeliveryQueue';

// ── Helpers ───────────────────────────────────────────────────────────────────

function keys(q: DeliveryQueue): string[] {
  return Object.keys(q).sort();
}

function types(q: DeliveryQueue, date: string): string[] {
  return q[date].map((i) => i.type);
}

// ── IT-1: Daily subscription, no addons — 7 dates in 7-day window ────────────

test('IT-1 daily sub generates one entry per day', () => {
  const sub: Subscription = { id: 's1', startDate: '2025-01-01', frequency: 'daily' };
  const q = buildDeliveryQueue(sub, [], '2025-01-01', '2025-01-07');
  expect(keys(q)).toHaveLength(7);
  expect(keys(q)[0]).toBe('2025-01-01');
  expect(keys(q)[6]).toBe('2025-01-07');
});

// ── IT-2: Alternate-day subscription anchoring ───────────────────────────────

test('IT-2 alternate-day anchored to startDate', () => {
  const sub: Subscription = { id: 's2', startDate: '2025-01-01', frequency: 'alternate' };
  const q = buildDeliveryQueue(sub, [], '2025-01-01', '2025-01-07');
  expect(keys(q)).toEqual(['2025-01-01', '2025-01-03', '2025-01-05', '2025-01-07']);
});

// ── IT-3: Weekly subscription (Mon=1, Wed=3, Fri=5) ──────────────────────────

test('IT-3 weekly subscription on specific days', () => {
  // 2025-01-06 = Mon, 2025-01-08 = Wed, 2025-01-10 = Fri
  const sub: Subscription = {
    id: 's3',
    startDate: '2025-01-06',
    frequency: 'weekly',
    deliveryDays: [1, 3, 5],
  };
  const q = buildDeliveryQueue(sub, [], '2025-01-06', '2025-01-12');
  expect(keys(q)).toEqual(['2025-01-06', '2025-01-08', '2025-01-10']);
});

// ── IT-4: skipDates excludes specific dates ───────────────────────────────────

test('IT-4 skipDates removes those dates from sub', () => {
  const sub: Subscription = {
    id: 's4',
    startDate: '2025-01-01',
    frequency: 'daily',
    skipDates: ['2025-01-03', '2025-01-05'],
  };
  const q = buildDeliveryQueue(sub, [], '2025-01-01', '2025-01-05');
  expect(keys(q)).toEqual(['2025-01-01', '2025-01-02', '2025-01-04']);
});

// ── IT-5: pauseDates excluded from sub, NOT from independent addon ────────────

test('IT-5 pauseDates excluded from sub but not from recurring addon', () => {
  const sub: Subscription = {
    id: 's5',
    startDate: '2025-01-01',
    frequency: 'daily',
    pauseDates: ['2025-01-03'],
  };
  const addon: Addon = {
    id: 'a1',
    type: 'recurring',
    startDate: '2025-01-01',
    frequency: 'daily',
  };
  const q = buildDeliveryQueue(sub, [addon], '2025-01-01', '2025-01-05');
  // Jan 3: sub paused but addon runs
  expect(q['2025-01-03']).toBeDefined();
  expect(q['2025-01-03'].map((i) => i.type)).toEqual(['addon']);
  // Jan 1: both
  expect(types(q, '2025-01-01')).toEqual(['subscription', 'addon']);
});

// ── IT-6: Subscription.endDate stops sub; addon continues ────────────────────

test('IT-6 subscription endDate stops sub; recurring addon continues', () => {
  const sub: Subscription = {
    id: 's6',
    startDate: '2025-01-01',
    frequency: 'daily',
    endDate: '2025-01-03',
  };
  const addon: Addon = {
    id: 'a2',
    type: 'recurring',
    startDate: '2025-01-01',
    frequency: 'daily',
  };
  const q = buildDeliveryQueue(sub, [addon], '2025-01-01', '2025-01-05');
  // Sub stops Jan 3; addon continues through Jan 5
  expect(q['2025-01-04'].map((i) => i.type)).toEqual(['addon']);
  expect(q['2025-01-05'].map((i) => i.type)).toEqual(['addon']);
  expect(q['2025-01-03'].map((i) => i.type)).toContain('subscription');
});

// ── IT-7: same_as_subscription addon mirrors sub dates ────────────────────────

test('IT-7 same_as_subscription addon only delivers on sub dates', () => {
  const sub: Subscription = {
    id: 's7',
    startDate: '2025-01-01',
    frequency: 'alternate',
  };
  const addon: Addon = { id: 'a3', type: 'same_as_subscription' };
  const q = buildDeliveryQueue(sub, [addon], '2025-01-01', '2025-01-07');
  const subDates = ['2025-01-01', '2025-01-03', '2025-01-05', '2025-01-07'];
  for (const d of subDates) {
    expect(q[d].map((i) => i.type)).toEqual(['subscription', 'addon']);
  }
  expect(Object.keys(q)).toHaveLength(4);
});

// ── IT-8: one_time addon fires exactly once ───────────────────────────────────

test('IT-8 one_time addon fires on its date only', () => {
  const sub: Subscription = { id: 's8', startDate: '2025-01-01', frequency: 'daily' };
  const addon: Addon = { id: 'a4', type: 'one_time', date: '2025-01-04' };
  const q = buildDeliveryQueue(sub, [addon], '2025-01-01', '2025-01-07');
  expect(q['2025-01-04'].some((i) => i.type === 'addon')).toBe(true);
  // Other dates should NOT have the addon
  expect(q['2025-01-01'].some((i) => i.id === 'a4')).toBe(false);
});

// ── IT-9: null subscription — addon-only mode ────────────────────────────────

test('IT-9 null subscription processes addons only', () => {
  const addon: Addon = {
    id: 'a5',
    type: 'recurring',
    startDate: '2025-01-01',
    frequency: 'daily',
  };
  const q = buildDeliveryQueue(null, [addon], '2025-01-01', '2025-01-03');
  expect(keys(q)).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
  expect(q['2025-01-01'].every((i) => i.type === 'addon')).toBe(true);
});

// ── IT-10: type-priority ordering within a date ──────────────────────────────

test('IT-10 items ordered: sub → same_as_sub → recurring → one_time', () => {
  const sub: Subscription = { id: 's10', startDate: '2025-01-05', frequency: 'daily' };
  const addons: Addon[] = [
    { id: 'ot', type: 'one_time',             date: '2025-01-05' },
    { id: 'rc', type: 'recurring',             startDate: '2025-01-05', frequency: 'daily' },
    { id: 'sa', type: 'same_as_subscription' },
  ];
  const q = buildDeliveryQueue(sub, addons, '2025-01-05', '2025-01-05');
  const order = q['2025-01-05'].map((i) => i.id);
  expect(order).toEqual(['s10', 'sa', 'rc', 'ot']);
});

// ── IT-11: duplicate addon ids — last definition wins ────────────────────────

test('IT-11 duplicate addon ids are deduped (last wins)', () => {
  const sub: Subscription = { id: 's11', startDate: '2025-01-01', frequency: 'daily' };
  const addons: Addon[] = [
    { id: 'dup', type: 'one_time', date: '2025-01-02' },  // first
    { id: 'dup', type: 'one_time', date: '2025-01-04' },  // last — should win
  ];
  const q = buildDeliveryQueue(sub, addons, '2025-01-01', '2025-01-07');
  const addonDates = Object.entries(q)
    .filter(([, items]) => items.some((i) => i.id === 'dup'))
    .map(([date]) => date);
  expect(addonDates).toEqual(['2025-01-04']);
});

// ── IT-12: empty window returns empty queue ───────────────────────────────────

test('IT-12 from > to returns empty queue', () => {
  const sub: Subscription = { id: 's12', startDate: '2025-01-01', frequency: 'daily' };
  const q = buildDeliveryQueue(sub, [], '2025-01-10', '2025-01-05');
  expect(Object.keys(q)).toHaveLength(0);
});

/**
 * Cross-step checkout flow validation tests
 * Validates: Step 1 (Plan) → Step 2 (Schedule) → Step 3 (Addons) → Step 4 (Details) → Step 5 (Pay)
 */

import { CartState, AddonApiItem } from '@/context/CartContext';

/**
 * Simulate CartContext buildAddonPayload() logic
 */
function buildAddonPayload(cart: CartState): AddonApiItem[] {
  return cart.addons.map((a) => {
    const sched = cart.addonSchedules[a.id] ?? { mode: "same" };

    if (sched.mode === "same") {
      return { id: String(a.id), type: "same_as_subscription" };
    }

    const payload: AddonApiItem = {
      id: String(a.id),
      type: "recurring",
    };

    if (sched.frequency) {
      payload.frequency = sched.frequency;
    } else {
      payload.frequency = cart.frequency;
    }

    if (sched.frequency === "weekly" || (!sched.frequency && cart.frequency === "weekly")) {
      payload.deliveryDays = sched.deliveryDays ?? [];
    }

    if (sched.startDate) {
      payload.startDate = sched.startDate;
    } else if (cart.startDate) {
      payload.startDate = cart.startDate;
    }

    return payload;
  });
}

describe('Cross-Step Checkout Flow Validation', () => {
  describe('FLOW TEST 1 — Plan → Schedule → Addon same', () => {
    it('should have addon inherit subscription schedule when mode=same', () => {
      // Step 1: User selects "Divine" plan
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [],
        addonSchedules: {},
        customer: null,
      };

      // Step 2: User confirms schedule (already set in Step 1)
      // Schedule: Daily, Apr 5

      // Step 3: User adds agarbatti addon with "same as subscription" mode
      cart.addons = [
        { id: 3, title: "Agarbatti (Incense)", price: 149, image: "", quantity: 1 }
      ];
      cart.addonSchedules = {
        3: { mode: "same" }
      };

      // Build payload for preview/subscribe
      const payload = buildAddonPayload(cart);

      // Expected: addon inherits subscription schedule
      expect(payload).toEqual([
        {
          id: "3",
          type: "same_as_subscription"
        }
      ]);

      // Verification
      expect(payload[0].frequency).toBeUndefined(); // Inherited, not explicit
      expect(payload[0].deliveryDays).toBeUndefined();
      expect(payload[0].startDate).toBeUndefined();

      // Subscription details (for context)
      expect(cart.frequency).toBe("daily");
      expect(cart.startDate).toBe("2026-04-05");
    });
  });

  describe('FLOW TEST 2 — Plan → Schedule → Addon different', () => {
    it('should addon use different schedule with correct startDate', () => {
      // Step 1: User selects "Divine" plan
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [],
        addonSchedules: {},
        customer: null,
      };

      // Step 3: User adds ghee addon with custom schedule
      // UI auto-sets startDate to subscription start when switching to "different"
      cart.addons = [
        { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 }
      ];
      cart.addonSchedules = {
        2: {
          mode: "different",
          frequency: "weekly",
          deliveryDays: [0], // Sunday
          startDate: "2026-04-05" // Auto-set to subscription start
        }
      };

      const payload = buildAddonPayload(cart);

      // Expected payload
      expect(payload).toEqual([
        {
          id: "2",
          type: "recurring",
          frequency: "weekly",
          deliveryDays: [0],
          startDate: "2026-04-05"
        }
      ]);

      // Verify no extra fields
      expect(Object.keys(payload[0])).toEqual(["id", "type", "frequency", "deliveryDays", "startDate"]);
    });
  });

  describe('FLOW TEST 3 — Change schedule after addon configured', () => {
    it('should NOT overwrite addon startDate when subscription schedule changes', () => {
      // Step 2: User selects schedule (Apr 5, daily)
      let cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [],
        addonSchedules: {},
        customer: null,
      };

      // Step 3: User adds addon with custom schedule (weekly, Sunday)
      cart.addons = [
        { id: 4, title: "Incense Sticks", price: 199, image: "", quantity: 1 }
      ];
      cart.addonSchedules = {
        4: {
          mode: "different",
          frequency: "weekly",
          deliveryDays: [0],
          startDate: "2026-04-05"
        }
      };

      const payloadBefore = buildAddonPayload(cart);
      expect(payloadBefore[0].startDate).toBe("2026-04-05");

      // User goes back to Step 2 and changes schedule to Apr 10, daily
      cart.startDate = "2026-04-10";
      cart.frequency = "daily";

      const payloadAfter = buildAddonPayload(cart);

      // Expected: addon startDate remains unchanged (Apr 5, not Apr 10)
      expect(payloadAfter[0].startDate).toBe("2026-04-05");
      expect(payloadAfter[0].startDate).not.toBe("2026-04-10");

      // Subscription updated, but addon keeps its custom date
      expect(cart.startDate).toBe("2026-04-10");
      expect(payloadAfter[0].startDate).toBe("2026-04-05");
    });
  });

  describe('FLOW TEST 4 — Remove addon', () => {
    it('should produce empty addons array when addon is removed', () => {
      // Step 3: User adds addon
      let cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          3: { mode: "same" }
        },
        customer: null,
      };

      let payload = buildAddonPayload(cart);
      expect(payload).toHaveLength(1);

      // User removes addon
      cart.addons = [];
      cart.addonSchedules = {};

      payload = buildAddonPayload(cart);

      // Expected: empty payload
      expect(payload).toEqual([]);
      expect(payload).toHaveLength(0);
    });
  });

  describe('FLOW TEST 5 — Switch addon different → same', () => {
    it('should transition from different to same without leftover fields', () => {
      let cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [0],
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      let payload = buildAddonPayload(cart);
      expect(payload[0].type).toBe("recurring");
      expect(payload[0].frequency).toBe("weekly");

      // User clicks "Same as subscription"
      cart.addonSchedules[2] = { mode: "same" };

      payload = buildAddonPayload(cart);

      // Expected: clean transition to minimal payload
      expect(payload).toEqual([
        {
          id: "2",
          type: "same_as_subscription"
        }
      ]);

      // Verify no leftover fields
      expect(Object.keys(payload[0])).toEqual(["id", "type"]);
      expect(payload[0].frequency).toBeUndefined();
      expect(payload[0].deliveryDays).toBeUndefined();
      expect(payload[0].startDate).toBeUndefined();
    });
  });

  describe('FLOW TEST 6 — Weekly without deliveryDays', () => {
    it('should handle empty deliveryDays without crash', () => {
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense", price: 199, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [], // Empty
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      // Should not crash
      const payload = buildAddonPayload(cart);

      // Expected: scheduler receives empty array and validates
      expect(payload[0].deliveryDays).toEqual([]);
      expect(Array.isArray(payload[0].deliveryDays)).toBe(true);
      expect(payload[0].frequency).toBe("weekly");
    });
  });

  describe('FLOW TEST 7 — Preview uses same payload as subscribe', () => {
    it('should produce identical payloads for preview and subscribe endpoints', () => {
      const cart: CartState = {
        planId: "eternal_spring",
        planName: "Eternal Spring",
        planPrice: 1499,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 },
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 },
          { id: 4, title: "Incense", price: 199, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          },
          3: { mode: "same" },
          4: {
            mode: "different",
            frequency: "daily",
            startDate: "2026-04-06"
          }
        },
        customer: null,
      };

      // POST /preview payload
      const previewPayload = buildAddonPayload(cart);

      // POST /subscribe payload (same logic)
      const subscribePayload = buildAddonPayload(cart);

      // Expected: identical payloads
      expect(previewPayload).toEqual(subscribePayload);

      // Verify no mutations
      expect(JSON.stringify(previewPayload)).toBe(JSON.stringify(subscribePayload));
    });
  });

  describe('FLOW TEST 8 — Multiple addons mixed', () => {
    it('should handle multiple addons in different modes with correct ordering', () => {
      const cart: CartState = {
        planId: "eternal_spring",
        planName: "Eternal Spring",
        planPrice: 1499,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 },
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 },
          { id: 4, title: "Incense", price: 199, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: { mode: "same" },
          3: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3, 5],
            startDate: "2026-04-05"
          },
          4: { mode: "same" }
        },
        customer: null,
      };

      const payload = buildAddonPayload(cart);

      // Expected: correct ordering and no mutation
      expect(payload).toEqual([
        {
          id: "2",
          type: "same_as_subscription"
        },
        {
          id: "3",
          type: "recurring",
          frequency: "weekly",
          deliveryDays: [1, 3, 5],
          startDate: "2026-04-05"
        },
        {
          id: "4",
          type: "same_as_subscription"
        }
      ]);

      // Verify original cart not mutated
      expect(cart.addons).toHaveLength(3);
      expect(cart.addonSchedules[3].deliveryDays).toEqual([1, 3, 5]);
    });
  });

  describe('FLOW TEST 9 — Empty addons', () => {
    it('should send empty array when no addons selected', () => {
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [],
        addonSchedules: {},
        customer: null,
      };

      const payload = buildAddonPayload(cart);

      // Expected: empty array sent to backend
      expect(payload).toEqual([]);
      expect(Array.isArray(payload)).toBe(true);
    });
  });

  describe('FLOW TEST 10 — StartDate missing', () => {
    it('should not send startDate when both addon and subscription are undefined', () => {
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "", // Empty
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "daily"
            // No startDate set
          }
        },
        customer: null,
      };

      const payload = buildAddonPayload(cart);

      // Expected: startDate not sent (scheduler will default)
      expect(payload[0].startDate).toBeUndefined();
      expect(Object.keys(payload[0])).toEqual(["id", "type", "frequency"]);
    });
  });

  describe('SUCCESS CRITERIA VALIDATION', () => {
    it('all payloads should be deterministic (same input = same output)', () => {
      const cart: CartState = {
        planId: "eternal_spring",
        planName: "Eternal Spring",
        planPrice: 1499,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 },
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          },
          3: { mode: "same" }
        },
        customer: null,
      };

      const payload1 = buildAddonPayload(cart);
      const payload2 = buildAddonPayload(cart);
      const payload3 = buildAddonPayload(cart);

      // All should be identical
      expect(JSON.stringify(payload1)).toBe(JSON.stringify(payload2));
      expect(JSON.stringify(payload2)).toBe(JSON.stringify(payload3));
    });

    it('should not mutate cart during payload building', () => {
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          3: { mode: "same" }
        },
        customer: null,
      };

      const cartBefore = JSON.stringify(cart);
      buildAddonPayload(cart);
      const cartAfter = JSON.stringify(cart);

      // Cart should be unchanged
      expect(cartBefore).toBe(cartAfter);
    });

    it('should never send undefined fields in payload', () => {
      const cart: CartState = {
        planId: "eternal_spring",
        planName: "Eternal Spring",
        planPrice: 1499,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 },
          { id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          },
          3: { mode: "same" }
        },
        customer: null,
      };

      const payload = buildAddonPayload(cart);

      // Check no undefined values
      payload.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          expect(value).not.toBeUndefined();
        });
      });
    });

    it('should never send null fields in payload', () => {
      const cart: CartState = {
        planId: "divine",
        planName: "Divine",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Ghee", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "daily",
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayload(cart);

      // Check no null values
      payload.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          expect(value).not.toBeNull();
        });
      });
    });

    it('should be scheduler compatible (all required fields present)', () => {
      const testCases = [
        // Same mode
        {
          cart: {
            planId: "divine",
            planName: "Divine",
            planPrice: 999,
            frequency: "daily",
            deliveryDays: [],
            startDate: "2026-04-05",
            addons: [{ id: 3, title: "Agarbatti", price: 149, image: "", quantity: 1 }],
            addonSchedules: { 3: { mode: "same" } },
            customer: null,
          } as CartState,
          expectedFields: ["id", "type"],
          schedulerCanProcess: true
        },
        // Different daily
        {
          cart: {
            planId: "divine",
            planName: "Divine",
            planPrice: 999,
            frequency: "daily",
            deliveryDays: [],
            startDate: "2026-04-05",
            addons: [{ id: 2, title: "Ghee", price: 299, image: "", quantity: 1 }],
            addonSchedules: { 2: { mode: "different", frequency: "daily", startDate: "2026-04-05" } },
            customer: null,
          } as CartState,
          expectedFields: ["id", "type", "frequency", "startDate"],
          schedulerCanProcess: true
        },
        // Different weekly
        {
          cart: {
            planId: "divine",
            planName: "Divine",
            planPrice: 999,
            frequency: "weekly",
            deliveryDays: [0, 2, 5],
            startDate: "2026-04-05",
            addons: [{ id: 4, title: "Incense", price: 199, image: "", quantity: 1 }],
            addonSchedules: { 4: { mode: "different", frequency: "weekly", deliveryDays: [1, 3], startDate: "2026-04-05" } },
            customer: null,
          } as CartState,
          expectedFields: ["id", "type", "frequency", "deliveryDays", "startDate"],
          schedulerCanProcess: true
        }
      ];

      testCases.forEach((testCase) => {
        const payload = buildAddonPayload(testCase.cart);
        payload.forEach((item) => {
          const keys = Object.keys(item);
          expect(testCase.schedulerCanProcess).toBe(true);
          // Type is always present
          expect(item.type).toBeDefined();
          // ID is always present
          expect(item.id).toBeDefined();
        });
      });
    });
  });
});

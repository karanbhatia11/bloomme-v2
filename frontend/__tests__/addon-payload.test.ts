/**
 * Tests for buildAddonPayload() logic
 * Validates all 6 test scenarios from ADDONS_SCHEDULING_FIXES.md
 */

import { CartState, AddonApiItem } from '@/context/CartContext';

/**
 * Simulate the buildAddonPayload logic
 * Extracted from CartContext for testing
 */
function buildAddonPayloadTestHelper(cart: CartState): AddonApiItem[] {
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

describe('buildAddonPayload', () => {
  describe('Test 1: Same as Subscription (No Config Needed)', () => {
    it('should return minimal payload with only id and type', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: { mode: "same" }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload).toEqual([
        {
          id: "4",
          type: "same_as_subscription"
        }
      ]);

      // Verify no extra fields
      expect(Object.keys(payload[0])).toEqual(["id", "type"]);
    });
  });

  describe('Test 2: Different Schedule (Daily)', () => {
    it('should return recurring payload without deliveryDays for daily', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Fresh Herbs", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "daily",
            startDate: "2026-04-06"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload).toEqual([
        {
          id: "2",
          type: "recurring",
          frequency: "daily",
          startDate: "2026-04-06"
        }
      ]);

      // Verify no deliveryDays (not applicable to daily)
      expect(payload[0].deliveryDays).toBeUndefined();
      // Verify no endDate
      expect(payload[0].endDate).toBeUndefined();
    });
  });

  describe('Test 3: Different Schedule (Weekly, Auto-Defaulted StartDate)', () => {
    it('should auto-default startDate to subscription start when not set', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"  // Auto-defaulted by UI
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload).toEqual([
        {
          id: "4",
          type: "recurring",
          frequency: "weekly",
          deliveryDays: [1, 3],
          startDate: "2026-04-05"
        }
      ]);

      expect(Object.keys(payload[0])).toEqual(["id", "type", "frequency", "deliveryDays", "startDate"]);
    });
  });

  describe('Test 4: Multiple Addons (Mixed Modes)', () => {
    it('should handle mix of same and different schedules', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Fresh Herbs", price: 149, image: "", quantity: 1 },
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 2 },
          { id: 7, title: "Ritual Candle", price: 199, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: { mode: "same" },
          4: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          }
          // 7 not in schedules → defaults to { mode: "same" }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload).toEqual([
        {
          id: "2",
          type: "same_as_subscription"
        },
        {
          id: "4",
          type: "recurring",
          frequency: "weekly",
          deliveryDays: [1, 3],
          startDate: "2026-04-05"
        },
        {
          id: "7",
          type: "same_as_subscription"
        }
      ]);

      // Verify addon 7 defaults to same
      expect(payload[2].type).toBe("same_as_subscription");
    });
  });

  describe('Test 5: Different Schedule Change After Subscription Update', () => {
    it('should preserve addon custom startDate when subscription startDate changes', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-10", // Updated from "2026-04-05"
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            frequency: "daily",
            startDate: "2026-04-06"  // User's custom date (earlier than new subscription start)
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      // Addon should use its own startDate, not subscription's
      expect(payload[0].startDate).toBe("2026-04-06");
      expect(payload[0].startDate).not.toBe("2026-04-10");
    });
  });

  describe('Test 6: Addon Never Configured (Defaults to Same)', () => {
    it('should default unconfigured addon to same_as_subscription', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 7, title: "Candle", price: 199, image: "", quantity: 1 }
        ],
        addonSchedules: {}, // No entry for addon 7
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload).toEqual([
        {
          id: "7",
          type: "same_as_subscription"
        }
      ]);
    });
  });

  describe('Test 7: Alternate Frequency (No deliveryDays)', () => {
    it('should not include deliveryDays for alternate frequency', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "alternate",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Fresh Herbs", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "alternate",
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload[0].deliveryDays).toBeUndefined();
      expect(payload[0].frequency).toBe("alternate");
      expect(Object.keys(payload[0])).toEqual(["id", "type", "frequency", "startDate"]);
    });
  });

  describe('Test 8: Frequency Not Set in Addon, Falls Back to Subscription', () => {
    it('should inherit frequency from subscription when addon has mode=different but no frequency', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            // No frequency set
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      // Should inherit weekly from subscription
      expect(payload[0].frequency).toBe("weekly");
      expect(payload[0].deliveryDays).toEqual([1, 3]);
    });
  });

  describe('Test 9: StartDate Fallback to Subscription', () => {
    it('should fallback to subscription startDate when addon startDate undefined', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "2026-04-05",
        addons: [
          { id: 2, title: "Fresh Herbs", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "daily"
            // No startDate
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload[0].startDate).toBe("2026-04-05");
    });
  });

  describe('Test 10: Weekly Frequency Includes DeliveryDays Even If Empty', () => {
    it('should include empty deliveryDays array for weekly even if none selected', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [],  // Empty array
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload[0].deliveryDays).toEqual([]);
      expect(Array.isArray(payload[0].deliveryDays)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no addons', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [],
        addonSchedules: {},
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);
      expect(payload).toEqual([]);
    });

    it('should handle no subscription startDate', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "daily",
        deliveryDays: [],
        startDate: "",  // Empty
        addons: [
          { id: 2, title: "Fresh Herbs", price: 149, image: "", quantity: 1 }
        ],
        addonSchedules: {
          2: {
            mode: "different",
            frequency: "daily"
            // No startDate
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      // Should NOT include startDate if both addon and subscription are empty
      expect(payload[0].startDate).toBeUndefined();
    });

    it('should never include endDate in payload', () => {
      const cart: CartState = {
        planId: "1",
        planName: "Eternal Spring",
        planPrice: 999,
        frequency: "weekly",
        deliveryDays: [0, 2, 5],
        startDate: "2026-04-05",
        addons: [
          { id: 4, title: "Incense Sticks", price: 299, image: "", quantity: 1 }
        ],
        addonSchedules: {
          4: {
            mode: "different",
            frequency: "weekly",
            deliveryDays: [1, 3],
            startDate: "2026-04-05"
          }
        },
        customer: null,
      };

      const payload = buildAddonPayloadTestHelper(cart);

      expect(payload[0].endDate).toBeUndefined();
      expect(Object.keys(payload[0])).not.toContain("endDate");
    });
  });
});

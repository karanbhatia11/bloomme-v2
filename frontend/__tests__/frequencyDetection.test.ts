/**
 * Tests for advanced frequency detection
 */

import {
  detectFrequency,
  calculateMultiplier,
  calculatePrice,
  getFrequencyLabel,
  applyDailyShortcut,
  applyAlternateShortcut,
  applyWeekendsShortcut,
  createScheduleState,
} from "@/utils/frequencyDetection";

const VALID_START_DATE = "2026-04-03"; // Friday

describe("Frequency Detection System", () => {
  describe("detectFrequency()", () => {
    it("should detect daily for all 7 days", () => {
      expect(detectFrequency([0, 1, 2, 3, 4, 5, 6], VALID_START_DATE)).toBe("daily");
    });

    it("should detect weekends for Sat + Sun only", () => {
      expect(detectFrequency([0, 6], VALID_START_DATE)).toBe("weekends");
    });

    it("should detect weekends regardless of order", () => {
      expect(detectFrequency([6, 0], VALID_START_DATE)).toBe("weekends");
    });

    it("should detect alternate for [1,3,5] (Mon, Wed, Fri)", () => {
      const altPattern = applyAlternateShortcut();
      expect(altPattern).toEqual([1, 3, 5]);
      expect(detectFrequency(altPattern, VALID_START_DATE)).toBe("alternate");
    });

    it("should detect weekly for single day", () => {
      expect(detectFrequency([2], VALID_START_DATE)).toBe("weekly");
    });

    it("should detect weekly for multiple specific days (not daily/weekend/alternate)", () => {
      expect(detectFrequency([2, 4], VALID_START_DATE)).toBe("weekly"); // Wed, Fri
    });

    it("should detect custom for Sat + Sun + Mon", () => {
      expect(detectFrequency([0, 1, 6], VALID_START_DATE)).toBe("custom");
    });

    it("should detect custom for empty array", () => {
      expect(detectFrequency([], VALID_START_DATE)).toBe("custom");
    });

    it("should detect custom for 6 days (all except one)", () => {
      expect(detectFrequency([0, 1, 2, 3, 4, 5], VALID_START_DATE)).toBe("custom");
    });
  });

  describe("calculateMultiplier()", () => {
    it("should return 1.5 for weekends frequency", () => {
      expect(calculateMultiplier([0, 6], "weekends")).toBe(1.5);
    });

    it("should return 1.0 for daily frequency", () => {
      expect(calculateMultiplier([0, 1, 2, 3, 4, 5, 6], "daily")).toBe(1.0);
    });

    it("should return 1.0 for alternate frequency", () => {
      const altDays = applyAlternateShortcut(VALID_START_DATE);
      expect(calculateMultiplier(altDays, "alternate")).toBe(1.0);
    });

    it("should return 1.0 for weekly frequency", () => {
      expect(calculateMultiplier([2], "weekly")).toBe(1.0);
    });

    it("should return 1.5 for custom with Sat+Sun AND 3 or fewer days", () => {
      expect(calculateMultiplier([0, 6], "custom")).toBe(1.5); // 2 days: Sat, Sun
      expect(calculateMultiplier([0, 6, 1], "custom")).toBe(1.5); // 3 days: Sun, Mon, Sat
    });

    it("should return 1.0 for custom with Sat+Sun AND more than 3 days", () => {
      expect(calculateMultiplier([0, 6, 1, 2], "custom")).toBe(1.0); // 4 days
    });

    it("should return 1.0 for custom without Sat+Sun", () => {
      expect(calculateMultiplier([1, 2, 3], "custom")).toBe(1.0);
    });
  });

  describe("calculatePrice()", () => {
    it("should calculate daily price: 59 × 30 days × 1.0 = 1770", () => {
      expect(calculatePrice(59, 30, "daily", [0, 1, 2, 3, 4, 5, 6])).toBe(1770);
    });

    it("should calculate weekends price: 59 × 8 days × 1.5 = 708", () => {
      expect(calculatePrice(59, 8, "weekends", [0, 6])).toBe(708);
    });

    it("should calculate custom with premium: 59 × 3 days × 1.5 = 266", () => {
      expect(calculatePrice(59, 3, "custom", [0, 6, 1])).toBe(266);
    });

    it("should calculate custom without premium: 59 × 12 days × 1.0 = 708", () => {
      expect(calculatePrice(59, 12, "custom", [1, 2, 3])).toBe(708);
    });

    it("should calculate weekly price: 59 × 4 days × 1.0 = 236", () => {
      expect(calculatePrice(59, 4, "weekly", [2])).toBe(236);
    });
  });

  describe("getFrequencyLabel()", () => {
    it("should return 'Every day' for daily", () => {
      expect(getFrequencyLabel("daily")).toBe("Every day");
    });

    it("should return premium label for weekends", () => {
      expect(getFrequencyLabel("weekends")).toContain("Premium");
    });

    it("should return 'Every other day' for alternate", () => {
      expect(getFrequencyLabel("alternate")).toBe("Every other day");
    });

    it("should return 'Weekly' for weekly with 1 day", () => {
      expect(getFrequencyLabel("weekly", 1)).toContain("Weekly");
    });

    it("should return custom label with day count", () => {
      expect(getFrequencyLabel("custom", 12)).toBe("12 selected days");
    });
  });

  describe("Shortcut functions", () => {
    it("applyDailyShortcut should return all 7 days", () => {
      expect(applyDailyShortcut()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it("applyWeekendsShortcut should return Sat + Sun", () => {
      expect(applyWeekendsShortcut()).toEqual([0, 6]);
    });

    it("applyAlternateShortcut should return date-based pattern", () => {
      const pattern = applyAlternateShortcut(VALID_START_DATE);
      expect(pattern.length).toBeGreaterThan(0);
      // Pattern should be consistent
      expect(detectFrequency(pattern, VALID_START_DATE)).toBe("alternate");
    });
  });

  describe("Integration scenarios", () => {
    it("User clicks Daily button: [0-6] → daily, 1.0x", () => {
      const state = createScheduleState([0, 1, 2, 3, 4, 5, 6], VALID_START_DATE, 59, 30);
      expect(state.frequency).toBe("daily");
      expect(state.multiplier).toBe(1.0);
      expect(state.totalPrice).toBe(1770);
    });

    it("User clicks Weekends button: [0,6] → weekends, 1.5x", () => {
      const state = createScheduleState([0, 6], VALID_START_DATE, 59, 8);
      expect(state.frequency).toBe("weekends");
      expect(state.multiplier).toBe(1.5);
      expect(state.totalPrice).toBe(708);
    });

    it("User selects Sat+Sun+Mon: [0,1,6] → custom, 1.5x (3 days)", () => {
      const state = createScheduleState([0, 1, 6], VALID_START_DATE, 59, 3);
      expect(state.frequency).toBe("custom");
      expect(state.multiplier).toBe(1.5);
      expect(state.totalPrice).toBe(266);
    });

    it("User selects Sat+Sun+Mon+Tue: [0,1,2,6] → custom, 1.0x (4 days)", () => {
      const state = createScheduleState([0, 1, 2, 6], VALID_START_DATE, 59, 4);
      expect(state.frequency).toBe("custom");
      expect(state.multiplier).toBe(1.0);
      expect(state.totalPrice).toBe(236);
    });

    it("User clicks Alternate button: [1,3,5] → alternate, 1.0x", () => {
      const altDays = applyAlternateShortcut();
      const state = createScheduleState(altDays, VALID_START_DATE, 59, 15);
      expect(state.frequency).toBe("alternate");
      expect(state.multiplier).toBe(1.0);
    });

    it("User selects only Tuesday: [2] → weekly, 1.0x", () => {
      const state = createScheduleState([2], VALID_START_DATE, 59, 4);
      expect(state.frequency).toBe("weekly");
      expect(state.multiplier).toBe(1.0);
      expect(state.totalPrice).toBe(236);
    });

    it("User selects Wed + Fri: [2,5] → weekly, 1.0x", () => {
      const state = createScheduleState([2, 5], VALID_START_DATE, 59, 8);
      expect(state.frequency).toBe("weekly");
      expect(state.multiplier).toBe(1.0);
      expect(state.totalPrice).toBe(472);
    });
  });
});

# Automatic Frequency Detection System

## Overview

The frequency detection system automatically determines the delivery schedule type based on which weekdays the user selects. Users no longer manually choose frequency—it's **derived from their day selections**.

**Key Principle:** User picks days → System detects frequency → Price multiplier applied

---

## Detection Rules

| Days Selected | Detected Frequency | Multiplier | Example |
|---|---|---|---|
| All 7 days (0-6) | `daily` | 1.0x | Every day |
| Only Sat + Sun (0, 6) | `weekends` | 1.5x | **Premium** |
| Mon + Wed + Fri (1, 3, 5) | `alternate` | 1.0x | Every other day |
| Any other combo | `custom` | 1.0x | User's selection |

---

## Core Functions

### 1. `detectFrequency(days: number[])`

Detects frequency type based on selected weekdays.

```typescript
import { detectFrequency } from "@/utils/frequencyDetection";

detectFrequency([0, 1, 2, 3, 4, 5, 6]) // → "daily"
detectFrequency([0, 6])                // → "weekends"
detectFrequency([1, 3, 5])             // → "alternate"
detectFrequency([2, 4])                // → "custom"
detectFrequency([])                    // → "custom"
```

**Parameters:**
- `days`: Array of weekday numbers (0=Sunday, 6=Saturday)

**Returns:**
- `"daily"` | `"weekends"` | `"alternate"` | `"custom"`

---

### 2. `getMultiplier(frequency)`

Returns the price multiplier for a frequency type.

```typescript
import { getMultiplier } from "@/utils/frequencyDetection";

getMultiplier("weekends")  // → 1.5 (premium)
getMultiplier("daily")     // → 1.0
getMultiplier("alternate") // → 1.0
getMultiplier("custom")    // → 1.0
```

**Parameters:**
- `frequency`: Frequency type string

**Returns:**
- `1.0` (standard) or `1.5` (premium for weekends)

---

### 3. `calculatePrice(basePrice, daysCount, frequency)`

Calculates total price with multiplier applied.

```typescript
import { calculatePrice } from "@/utils/frequencyDetection";

// Daily: 59 × 30 days × 1.0 = 1770
calculatePrice(59, 30, "daily")        // → 1770

// Weekends: 59 × 8 days × 1.5 = 708
calculatePrice(59, 8, "weekends")      // → 708

// Custom: 59 × 12 days × 1.0 = 708
calculatePrice(59, 12, "custom")       // → 708
```

**Parameters:**
- `basePrice`: Price per day (e.g., 59)
- `daysCount`: Number of days selected
- `frequency`: Frequency type

**Returns:**
- Integer total price (rounded)

---

### 4. `getFrequencyLabel(frequency, daysCount?)`

Human-readable label for UI display.

```typescript
import { getFrequencyLabel } from "@/utils/frequencyDetection";

getFrequencyLabel("daily")             // → "Every day"
getFrequencyLabel("weekends")          // → "Weekends only ✨ Premium"
getFrequencyLabel("alternate")         // → "Every other day"
getFrequencyLabel("custom", 12)        // → "12 selected days"
```

---

## Test Coverage

### Test File: `__tests__/frequencyDetection.test.ts`

**30 tests across 5 suites:**

#### detectFrequency() - 10 tests
✅ All 7 days → daily  
✅ Sat + Sun → weekends  
✅ Mon + Wed + Fri → alternate  
✅ [0, 6, 1] → custom  
✅ [1, 2, 3, 4, 5, 6] → custom  
✅ Single day → custom  
✅ Empty array → custom  
✅ Two random days → custom  
✅ Order-independent detection  
✅ Sorted or unsorted input

#### getMultiplier() - 4 tests
✅ Weekends → 1.5  
✅ Daily → 1.0  
✅ Alternate → 1.0  
✅ Custom → 1.0

#### calculatePrice() - 6 tests
✅ Daily: 59 × 30 × 1 = 1770  
✅ Alternate: 59 × 15 × 1 = 885  
✅ Weekends: 59 × 8 × 1.5 = 708  
✅ Custom: 59 × 12 × 1 = 708  
✅ Weekends premium: 59 × 2 × 1.5 = 177  
✅ Rounding: 59 × 3 × 1.5 = 266

#### getFrequencyLabel() - 5 tests
✅ Label for daily  
✅ Label for weekends  
✅ Label for alternate  
✅ Label for custom with count  
✅ Label for custom with 0 days

#### Integration Scenarios - 5 tests
✅ [0, 6] → weekends 1.5x multiplier  
✅ [0, 6, 1] → custom 1x multiplier  
✅ [0..6] → daily 1x multiplier  
✅ [1, 3, 5] → alternate 1x multiplier  
✅ [2, 4] → custom 1x multiplier

**All 58 tests passing** (including prior tests)

---

## Implementation Notes

### User Flow

1. **User selects days** (e.g., clicks Sunday and Saturday)
2. **System calls `detectFrequency([0, 6])`** → Returns `"weekends"`
3. **System calls `getMultiplier("weekends")`** → Returns `1.5`
4. **System calls `calculatePrice(59, 8, "weekends")`** → Returns `708`
5. **UI updates:** Shows "Weekends only ✨ Premium" with ₹708

### Auto-Detection Flow

```typescript
// When user toggles a day:
const selectedDays = [0, 6]; // Sun + Sat
const frequency = detectFrequency(selectedDays); // "weekends"
const multiplier = getMultiplier(frequency); // 1.5
const price = calculatePrice(basePrice, daysCount, frequency); // 708
```

### Premium Pricing

**Weekends only (Saturday + Sunday):**
- Base: ₹59/day
- Premium: ₹59 × 1.5 = **₹88.50/day**
- Example: 8 weekend days = ₹88.50 × 8 = **₹708**

---

## Edge Cases Handled

| Input | Result |
|---|---|
| `[]` (empty) | Custom, multiplier 1.0 |
| `[0, 6]` (any order) | Weekends, multiplier 1.5 |
| `[6, 0]` (reversed) | Weekends, multiplier 1.5 |
| Single day | Custom, multiplier 1.0 |
| 6 days (missing 1) | Custom, multiplier 1.0 |
| Duplicate days | Handled (deduplicated) |
| Non-integer multipliers | Rounded to nearest integer |

---

## Usage Examples

### Example 1: User Picks All Days

```typescript
const days = [0, 1, 2, 3, 4, 5, 6];
const freq = detectFrequency(days);    // "daily"
const mult = getMultiplier(freq);      // 1.0
const price = calculatePrice(59, 30, freq); // 1770

// Display: "Every day" - ₹1770
```

### Example 2: User Picks Weekends

```typescript
const days = [0, 6];
const freq = detectFrequency(days);    // "weekends"
const mult = getMultiplier(freq);      // 1.5
const price = calculatePrice(59, 8, freq); // 708

// Display: "Weekends only ✨ Premium" - ₹708
```

### Example 3: User Picks Random Days

```typescript
const days = [1, 2, 3];
const freq = detectFrequency(days);    // "custom"
const mult = getMultiplier(freq);      // 1.0
const price = calculatePrice(59, 12, freq); // 708

// Display: "12 selected days" - ₹708
```

---

## Integration with UI

The detection system is **ready to integrate** into Step 2 (Schedule):

1. Remove frequency buttons
2. Show only day picker
3. On day selection change:
   - Call `detectFrequency(selectedDays)`
   - Call `calculatePrice(basePrice, daysCount, frequency)`
   - Update UI with frequency label and price

---

## Files

- **`utils/frequencyDetection.ts`** — Core functions (4 exports)
- **`__tests__/frequencyDetection.test.ts`** — 30 tests, all passing
- **Test Results:** ✅ 58/58 passing

---

## Future Enhancement

Currently, weekends cannot be manually selected—they're auto-derived from [0, 6]. To add a UI button for "Weekends" frequency, remove the constraint and let users toggle it directly, then validate against rules.

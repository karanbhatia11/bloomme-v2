# Delivery Schedule Integration Guide

## Overview

When orders are placed, delivery schedules are **automatically created** via PL/pgSQL triggers. However, the backend must properly populate order items to enable this automation.

---

## Order Item Requirements

### For Subscriptions (Plans)
When creating an `order_item` with `item_type = 'subscription'`:
- **Requirement:** None (trigger handles automatically)
- **Behavior:** Trigger creates a daily recurring schedule
  - Duration: Today → 30 days from now
  - Frequency: daily
  
**Example:**
```sql
INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
VALUES (63, 'subscription', 1, 1, 2314);
-- Trigger auto-creates: daily schedule, 30 days from TODAY
```

---

### For Add-ons (Custom Schedule Items)
When creating an `order_item` with `item_type = 'addon'`:
- **Requirement:** MUST populate `custom_schedule_dates` with specific DATE array
- **Behavior:** Trigger creates a custom schedule with exact delivery dates

**Example:**
```sql
INSERT INTO order_items (
  order_id, 
  item_type, 
  item_id, 
  quantity, 
  price,
  custom_schedule_dates
)
VALUES (
  63, 
  'addon', 
  5,
  1,
  195,
  ARRAY['2026-04-12'::DATE, '2026-04-19'::DATE, '2026-04-26'::DATE, '2026-05-03'::DATE, '2026-05-10'::DATE]
);
-- Trigger auto-creates: custom schedule with 5 specific dates
```

---

## Schema Reference

### order_items columns (relevant to schedules)
| Column | Type | Notes |
|--------|------|-------|
| `item_type` | TEXT | 'subscription' \| 'addon' |
| `custom_schedule_dates` | DATE[] | Required for add-ons, NULL for subscriptions |

### delivery_schedules (auto-created)
| Column | Auto-Set | Notes |
|--------|----------|-------|
| `schedule_type` | 'custom' or 'recurring' | Depends on item type |
| `frequency` | 'daily' or 'custom' | Depends on schedule type |
| `custom_dates` | DATE[] | From `order_items.custom_schedule_dates` |
| `start_date` | TODAY or custom_dates[0] | From order or computed |
| `end_date` | TODAY+30 or custom_dates[-1] | From order or computed |

---

## Backend Implementation Checklist

When processing an order with add-ons:

- [ ] Parse add-on delivery dates from request
- [ ] Convert to PostgreSQL DATE array format: `ARRAY['YYYY-MM-DD'::DATE, ...]`
- [ ] Insert into `order_items` with `custom_schedule_dates` populated
- [ ] Trigger automatically creates matching `delivery_schedule` record
- [ ] Query `delivery_schedules` to verify creation (optional)

---

## Testing

### Test Case: Order with Add-ons (like Order #63)

**What to do:**
```sql
-- Insert order_item WITH custom_schedule_dates
INSERT INTO order_items (order_id, item_type, item_id, quantity, price, custom_schedule_dates)
VALUES (
  63,
  'addon',
  5,
  1,
  19500,
  ARRAY['2026-04-12'::DATE, '2026-04-19'::DATE, '2026-04-26'::DATE, '2026-05-03'::DATE, '2026-05-10'::DATE]
);
```

**Verify:**
```sql
-- Should auto-create delivery_schedule with custom dates
SELECT * FROM delivery_schedules WHERE order_item_id = (SELECT id FROM order_items WHERE order_id = 63 AND item_type = 'addon' LIMIT 1);
```

---

## Common Issues

### Problem: Add-on has no delivery_schedule
**Cause:** `custom_schedule_dates` was NULL when order_item was inserted

**Solution:** Repopulate the column before inserting:
```sql
UPDATE order_items 
SET custom_schedule_dates = ARRAY['2026-04-12'::DATE, '2026-04-19'::DATE, ...]
WHERE order_id = 63 AND item_type = 'addon';

-- Then manually create the schedule or re-insert the item
```

### Problem: Subscription has wrong date range
**Cause:** Trigger used TODAY as start_date (which was order creation date)

**Solution:** If you need a specific start date, manually update the schedule:
```sql
UPDATE delivery_schedules 
SET start_date = '2026-04-12', end_date = '2026-05-11'
WHERE order_item_id = 122;
```

---

## Trigger Functions

### `create_delivery_schedule()`
- **Fires:** AFTER INSERT on `order_items`
- **Location:** PostgreSQL function (created April 11, 2026)
- **Logic:**
  ```
  IF custom_schedule_dates IS NOT NULL
    → create 'custom' schedule with those dates
  ELSE IF item_type = 'subscription'
    → create 'recurring' daily schedule (30 days)
  ELSE
    → do nothing (ad-hoc items)
  ```

---

## API Integration Notes

When your order placement API creates order items:

1. **Parse request:** Get add-on delivery dates from frontend
2. **Transform:** Convert to DATE array: `ARRAY[date1, date2, ...]::DATE[]`
3. **Insert:** Include `custom_schedule_dates` in the INSERT
4. **Verify:** Optionally query `delivery_schedules` to confirm trigger fired

Example (Node.js/TypeScript):
```typescript
const customDates = orderedAddons.map(a => a.deliveryDate); // ['2026-04-12', '2026-04-19', ...]
const dateArray = `ARRAY[${customDates.map(d => `'${d}'::DATE`).join(', ')}]`;

await db.query(
  `INSERT INTO order_items (order_id, item_type, item_id, quantity, price, custom_schedule_dates)
   VALUES ($1, 'addon', $2, $3, $4, ${dateArray})`,
  [orderId, addonId, quantity, price]
);
// Trigger fires automatically → delivery_schedule created
```

---

## Last Updated
April 11, 2026 — Delivery Schedule Automation Setup

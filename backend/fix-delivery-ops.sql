-- ============================================================================
-- DELIVERY OPERATIONS FIX - April 11, 2026
-- ============================================================================
-- This migration addresses 7 architectural issues:
-- 1. Missing operational deliveries table (1 row per delivery)
-- 2. Separation of schedule rules vs execution
-- 3. Single source of truth for delivery preferences
-- 4. Queryable/indexable delivery dates
-- 5. Status tracking for operations
-- 6. Clear unit pricing
-- 7. Better schema semantics
-- ============================================================================

-- 1. CREATE DELIVERIES TABLE (Operational Layer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  delivery_schedule_id INTEGER NOT NULL REFERENCES delivery_schedules(id) ON DELETE CASCADE,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,

  -- Ops Status Tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'skipped', 'failed')),
  delivered_at TIMESTAMP,
  skip_reason TEXT,
  notes TEXT,

  -- Pricing Clarity (unit price per delivery)
  unit_price DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_schedule_id ON deliveries(delivery_schedule_id);
CREATE INDEX idx_deliveries_order_item_id ON deliveries(order_item_id);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_date_status ON deliveries(delivery_date, status);

COMMENT ON TABLE deliveries IS 'Operational table: 1 row per actual delivery. Auto-expanded from delivery_schedules.custom_dates. Ops reads this daily.';
COMMENT ON COLUMN deliveries.status IS 'pending=scheduled, delivered=completed, skipped=user-initiated skip, failed=operational failure';
COMMENT ON COLUMN deliveries.unit_price IS 'Price per delivery (extracted from order_items.price / delivery count for add-ons)';

-- ============================================================================
-- 2. CREATE TRIGGER TO AUTO-EXPAND DELIVERY SCHEDULES → DELIVERIES
-- ============================================================================
CREATE OR REPLACE FUNCTION expand_delivery_schedules()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
  delivery_date DATE;
  order_item_rec RECORD;
  unit_price_val DECIMAL(10, 2);
BEGIN
  -- Only process if custom_dates is populated (custom schedules)
  IF NEW.custom_dates IS NOT NULL AND ARRAY_LENGTH(NEW.custom_dates, 1) > 0 THEN

    -- Get order_item details for unit price calculation
    SELECT quantity, price INTO order_item_rec
    FROM order_items
    WHERE id = NEW.order_item_id;

    -- Calculate unit price: total price ÷ number of deliveries
    IF order_item_rec IS NOT NULL THEN
      unit_price_val := ROUND(order_item_rec.price::NUMERIC / ARRAY_LENGTH(NEW.custom_dates, 1), 2);
    END IF;

    -- Create 1 row per custom date
    FOR i IN 1..ARRAY_LENGTH(NEW.custom_dates, 1) LOOP
      delivery_date := NEW.custom_dates[i];

      INSERT INTO deliveries (
        delivery_schedule_id,
        order_item_id,
        delivery_date,
        quantity,
        unit_price,
        status,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.order_item_id,
        delivery_date,
        COALESCE(order_item_rec.quantity, 1),
        unit_price_val,
        'pending',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if exists, recreate with expand logic
DROP TRIGGER IF EXISTS trigger_expand_deliveries ON delivery_schedules;

CREATE TRIGGER trigger_expand_deliveries
AFTER INSERT OR UPDATE OF custom_dates ON delivery_schedules
FOR EACH ROW
EXECUTE FUNCTION expand_delivery_schedules();

-- ============================================================================
-- 3. BACKFILL EXISTING SCHEDULES → DELIVERIES (Zero-Loss Migration)
-- ============================================================================
-- Auto-expand all existing delivery_schedules that have custom_dates
INSERT INTO deliveries (
  delivery_schedule_id,
  order_item_id,
  delivery_date,
  quantity,
  unit_price,
  status,
  created_at,
  updated_at
)
SELECT
  ds.id,
  ds.order_item_id,
  dates.delivery_date,
  COALESCE(oi.quantity, 1),
  ROUND(oi.price::NUMERIC / ARRAY_LENGTH(ds.custom_dates, 1), 2),
  'pending',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM delivery_schedules ds
CROSS JOIN LATERAL UNNEST(COALESCE(ds.custom_dates, ARRAY[]::DATE[])) AS dates(delivery_date)
JOIN order_items oi ON ds.order_item_id = oi.id
WHERE ds.custom_dates IS NOT NULL AND ARRAY_LENGTH(ds.custom_dates, 1) > 0
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. ENSURE DELIVERY_PREFERENCES IS SINGLE SOURCE OF TRUTH
-- ============================================================================
-- Backfill any addresses that don't have delivery_preferences yet
INSERT INTO delivery_preferences (
  address_id,
  time_slot,
  notes,
  building_type,
  created_at,
  updated_at
)
SELECT
  a.id,
  COALESCE(a.time_slot, '5:30 to 6:30'),
  a.delivery_notes,
  COALESCE(a.building_type, 'house'),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM addresses a
WHERE NOT EXISTS (
  SELECT 1 FROM delivery_preferences dp WHERE dp.address_id = a.id
)
ON CONFLICT (address_id) DO NOTHING;

-- ============================================================================
-- 5. ADD UNIT_PRICE TRACKING TO ORDER_ITEMS
-- ============================================================================
-- This helps with pricing clarity (price-per-delivery vs total)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_type VARCHAR(50) DEFAULT 'total' CHECK (price_type IN ('total', 'per_delivery'));

COMMENT ON COLUMN order_items.unit_price IS 'Unit price: For add-ons, price per delivery. For subscriptions, price per day.';
COMMENT ON COLUMN order_items.price_type IS 'total = price is for entire schedule, per_delivery = price per individual delivery';

-- Backfill existing orders: assume all prices are totals for now
UPDATE order_items SET price_type = 'total' WHERE price_type IS NULL;

-- ============================================================================
-- 6. CLEANUP: MARK DUPLICATE SOURCES FOR DEPRECATION
-- ============================================================================
-- These columns should eventually be removed (in next sprint)
-- For now, keep for backward compatibility
COMMENT ON COLUMN addresses.time_slot IS '[DEPRECATED] Use delivery_preferences.time_slot instead';
COMMENT ON COLUMN addresses.delivery_notes IS '[DEPRECATED] Use delivery_preferences.notes instead';
COMMENT ON COLUMN addresses.building_type IS '[DEPRECATED] Use delivery_preferences.building_type instead';

-- ============================================================================
-- 7. VERIFY EXPANSION & CONSISTENCY
-- ============================================================================
-- Count of deliveries created from schedules
SELECT
  COUNT(*) as total_deliveries,
  COUNT(DISTINCT delivery_schedule_id) as schedules_expanded,
  COUNT(DISTINCT order_item_id) as order_items_covered,
  MIN(delivery_date) as earliest_delivery,
  MAX(delivery_date) as latest_delivery,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
FROM deliveries;

-- Verify delivery_preferences coverage
SELECT
  COUNT(*) as total_addresses,
  COUNT(DISTINCT CASE WHEN dp.id IS NOT NULL THEN 1 END) as with_preferences,
  COUNT(DISTINCT CASE WHEN dp.id IS NULL THEN 1 END) as missing_preferences
FROM addresses a
LEFT JOIN delivery_preferences dp ON a.id = dp.address_id;

-- ============================================================================
-- SCHEMA SUMMARY (Post-Fix)
-- ============================================================================
/*

LAYER 1 - SCHEDULING RULES (Frontend/Backend)
- delivery_schedules: Define how often + what dates
  * schedule_type: 'recurring' | 'custom'
  * frequency: 'daily' | 'weekly' | 'custom'
  * custom_dates: DATE[] (specific dates for custom schedules)
  * start_date, end_date: Date range

LAYER 2 - OPERATIONAL EXECUTION (Ops)
- deliveries: 1 row per actual delivery (auto-expanded from custom_dates)
  * delivery_date: Specific date
  * status: pending | delivered | skipped | failed
  * unit_price: Clear pricing per delivery
  * delivered_at, skip_reason: Ops tracking

LAYER 3 - PREFERENCES (Configuration)
- delivery_preferences: Single source of truth
  * time_slot: Preferred delivery time
  * building_type: House | Apartment | Office | Villa | Other
  * notes: Special instructions
  * skip_weekends: Boolean flag

DATA FLOW
--------
User places order
  ↓
order_items created with custom_schedule_dates (DATE[])
  ↓
delivery_schedules trigger creates schedule record
  ↓
expand_delivery_schedules trigger creates deliveries rows
  ↓
Ops reads deliveries table for daily checklist
  ↓
Ops marks status = 'delivered' or 'skipped'

BACKWARD COMPATIBILITY
-----------
✅ addresses.time_slot / delivery_notes / building_type still exist
✅ Frontend/backend code unchanged
✅ New deliveries table is additive (no deletes)
✅ Existing custom_schedule_dates field still populated
✅ All triggers coexist (no conflicts)

*/


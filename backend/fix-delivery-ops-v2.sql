-- ============================================================================
-- DELIVERY OPERATIONS FIX v2 - April 11, 2026
-- Bridges old subscription-based deliveries with new order_items-based system
-- ============================================================================

-- 1. UPGRADE EXISTING DELIVERIES TABLE (keep old system working)
-- ============================================================================
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_schedule_id INTEGER REFERENCES delivery_schedules(id) ON DELETE CASCADE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS skip_reason TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update status constraint to include all valid values
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_status_check
  CHECK (status IN ('pending', 'delivered', 'skipped', 'failed'));

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_schedule_id ON deliveries(delivery_schedule_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_item_id ON deliveries(order_item_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date_status ON deliveries(delivery_date, status);

-- Drop old composite unique constraint (subscription_id, delivery_date)
-- because we now support both subscription_id and order_item_id
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_subscription_date_key;

-- Add flexible unique constraint that works for both old and new systems
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_unique_delivery;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_unique_delivery
  UNIQUE NULLS NOT DISTINCT (subscription_id, order_item_id, delivery_date);

COMMENT ON TABLE deliveries IS 'Unified operational deliveries table. Supports both legacy subscriptions (subscription_id) and new order_items (order_item_id). 1 row = 1 delivery.';
COMMENT ON COLUMN deliveries.subscription_id IS 'Legacy: FK to subscriptions table (old system)';
COMMENT ON COLUMN deliveries.order_item_id IS 'New: FK to order_items table (order-based system)';
COMMENT ON COLUMN deliveries.delivery_schedule_id IS 'New: FK to delivery_schedules table (for traceability)';
COMMENT ON COLUMN deliveries.status IS 'pending=scheduled, delivered=completed, skipped=user skip, failed=operational failure';
COMMENT ON COLUMN deliveries.unit_price IS 'Unit price per delivery (optional, extracted from order_items.price)';

-- ============================================================================
-- 2. AUTO-EXPAND TRIGGER: delivery_schedules.custom_dates → deliveries rows
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
      ON CONFLICT (subscription_id, order_item_id, delivery_date) DO NOTHING;
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
-- 3. BACKFILL EXISTING DELIVERY_SCHEDULES → DELIVERIES
-- ============================================================================
-- Auto-expand all delivery_schedules with custom_dates to deliveries rows
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
  AND NOT EXISTS (
    SELECT 1 FROM deliveries d
    WHERE d.delivery_schedule_id = ds.id
      AND d.delivery_date = dates.delivery_date
  )
ON CONFLICT (subscription_id, order_item_id, delivery_date) DO NOTHING;

-- ============================================================================
-- 4. ADD PRICING CLARITY TO ORDER_ITEMS
-- ============================================================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price_type VARCHAR(50) DEFAULT 'total'
  CHECK (price_type IN ('total', 'per_delivery'));

COMMENT ON COLUMN order_items.unit_price IS 'For reference: unit price if price_type is per_delivery';
COMMENT ON COLUMN order_items.price_type IS 'total = price is for all deliveries, per_delivery = price per individual delivery';

-- Backfill: assume all prices are totals
UPDATE order_items SET price_type = 'total' WHERE price_type IS NULL;

-- ============================================================================
-- 5. ENSURE DELIVERY_PREFERENCES IS SINGLE SOURCE OF TRUTH
-- ============================================================================
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

COMMENT ON COLUMN addresses.time_slot IS '[DEPRECATED v2] Use delivery_preferences.time_slot';
COMMENT ON COLUMN addresses.delivery_notes IS '[DEPRECATED v2] Use delivery_preferences.notes';
COMMENT ON COLUMN addresses.building_type IS '[DEPRECATED v2] Use delivery_preferences.building_type';

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Summary: Old vs New System
SELECT
  SUM(CASE WHEN subscription_id IS NOT NULL THEN 1 ELSE 0 END) as legacy_subscription_deliveries,
  SUM(CASE WHEN order_item_id IS NOT NULL THEN 1 ELSE 0 END) as new_order_deliveries,
  COUNT(*) as total_deliveries,
  COUNT(DISTINCT CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(DISTINCT delivery_date) as unique_dates,
  MIN(delivery_date) as earliest,
  MAX(delivery_date) as latest
FROM deliveries;

-- Check for any gaps
SELECT
  delivery_schedule_id,
  order_item_id,
  COUNT(*) as delivery_count,
  MIN(delivery_date) as first_date,
  MAX(delivery_date) as last_date
FROM deliveries
WHERE order_item_id IS NOT NULL
GROUP BY delivery_schedule_id, order_item_id
ORDER BY delivery_count DESC;

-- ============================================================================
-- SCHEMA SUMMARY (Post-Migration)
-- ============================================================================
/*

UNIFIED DELIVERIES TABLE (public.deliveries)
──────────────────────────────────────────────────────────────────
Columns:
  id                    SERIAL PRIMARY KEY
  subscription_id       INTEGER FK subscriptions (legacy/old system)
  order_item_id         INTEGER FK order_items (new system)
  delivery_schedule_id  INTEGER FK delivery_schedules (new system)
  delivery_date         DATE NOT NULL
  quantity              INTEGER DEFAULT 1
  status                VARCHAR CHECK (pending|delivered|skipped|failed)
  delivered_at          TIMESTAMP (when actually delivered)
  skip_reason           TEXT (why skipped if applicable)
  notes                 TEXT (special notes)
  unit_price            DECIMAL (price per delivery)
  created_at            TIMESTAMP
  updated_at            TIMESTAMP

Indexes:
  ✓ Primary Key: id
  ✓ subscription_id (legacy)
  ✓ order_item_id (new)
  ✓ delivery_schedule_id (new)
  ✓ delivery_date (operations)
  ✓ status (ops filtering)
  ✓ (delivery_date, status) (daily checklist)
  ✓ UNIQUE (subscription_id, order_item_id, delivery_date)

TWO SYSTEMS COEXIST
──────────────────────────────────────────────────────────────────
Legacy (still running):
  subscriptions → (cron job: generateDeliveries) → deliveries (subscription_id)

New (auto-triggered):
  order_items → delivery_schedules (trigger) → deliveries (order_item_id)

Operations:
  Reads from: SELECT * FROM deliveries WHERE status = 'pending' ORDER BY delivery_date;
  Updates: UPDATE deliveries SET status = 'delivered' WHERE id = ...;
  No code changes needed: subscription_id NULL for new orders, old subscription-based rows continue to work

BACKWARD COMPATIBILITY
──────────────────────────────────────────────────────────────────
✅ Old generateDeliveries job continues to work (subscription_id column still exists)
✅ Old queries still work (subscription_id indexed)
✅ New triggers auto-create deliveries for orders (order_item_id column)
✅ No deletions, only additive changes
✅ Unique constraint now flexible (handles both systems)
✅ delivery_preferences is canonical source for time_slot, building_type, notes

NEXT STEPS (Future Sprints)
──────────────────────────────────────────────────────────────────
- [ ] Migrate old subscriptions to use order_items + delivery_schedules
- [ ] Deprecate generateDeliveries job
- [ ] Deprecate addresses.time_slot / delivery_notes / building_type columns
- [ ] Add dashboard views for ops (daily checklist, delivery status)

*/

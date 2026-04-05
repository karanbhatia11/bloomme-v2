-- Scheduler Integration Migration
-- Run once against the production database

-- 1. Add scheduling columns to subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS frequency       TEXT    DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS end_date        DATE,
  ADD COLUMN IF NOT EXISTS pause_dates     JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS skip_dates      JSONB   DEFAULT '[]';

-- 2. Add addon scheduling columns to subscription_add_ons
ALTER TABLE subscription_add_ons
  ADD COLUMN IF NOT EXISTS addon_type          TEXT    DEFAULT 'same_as_subscription',
  ADD COLUMN IF NOT EXISTS addon_frequency     TEXT,
  ADD COLUMN IF NOT EXISTS addon_delivery_days JSONB,
  ADD COLUMN IF NOT EXISTS addon_custom_dates  JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS addon_start_date    DATE,
  ADD COLUMN IF NOT EXISTS addon_end_date      DATE;

-- 3. Add UNIQUE constraint to deliveries for upsert support
-- (safe to re-run: DO block catches duplicate constraint error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_deliveries_sub_date'
  ) THEN
    ALTER TABLE deliveries
      ADD CONSTRAINT uq_deliveries_sub_date
        UNIQUE (subscription_id, delivery_date);
  END IF;
END$$;

-- 4. Create delivery_items table (per-delivery line items from buildDeliveryQueue)
CREATE TABLE IF NOT EXISTS delivery_items (
  id               SERIAL PRIMARY KEY,
  delivery_id      INTEGER REFERENCES deliveries(id) ON DELETE CASCADE,
  item_type        TEXT    NOT NULL,   -- 'subscription' | 'addon'
  item_ref_id      TEXT    NOT NULL,   -- subscription.id or add_on.id (as string)
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery ON delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date         ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_sub_status   ON deliveries(subscription_id, status);

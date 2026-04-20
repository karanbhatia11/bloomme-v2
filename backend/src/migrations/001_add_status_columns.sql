-- Migration 001: Add status columns for cancellation/delivery lifecycle tracking
-- Date: 2026-04-20

-- Track cancellation status on individual order items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Delivery lifecycle status for addon-only orders (separate from payment status)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'active';

-- Track cancellation status on subscription add-ons
ALTER TABLE subscription_add_ons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Store plan name directly on subscriptions for faster lookups without joining plans table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT;

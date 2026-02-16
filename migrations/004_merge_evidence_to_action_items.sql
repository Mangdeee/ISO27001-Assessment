-- Add evidence fields to action_items table
ALTER TABLE action_items
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS clause_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS annex_reference VARCHAR(100);

-- Create index for clause reference
CREATE INDEX IF NOT EXISTS idx_action_items_clause ON action_items(clause_reference);

-- Note: We keep the evidence table for now but it's not used in the UI
-- The risk_register table is kept but not exposed in the UI

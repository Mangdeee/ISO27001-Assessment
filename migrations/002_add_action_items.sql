-- Add deadline and action_item_id to gap_assessments
ALTER TABLE gap_assessments 
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS action_item_id INTEGER;

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    assigned_to VARCHAR(255),
    due_date DATE,
    completed_date DATE,
    gap_assessment_id INTEGER REFERENCES gap_assessments(id) ON DELETE SET NULL,
    maturity_assessment_id INTEGER,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for action_items
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_gap_assessment ON action_items(gap_assessment_id);
CREATE INDEX IF NOT EXISTS idx_gap_assessments_target_date ON gap_assessments(target_date);

-- Create trigger for action_items updated_at
CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

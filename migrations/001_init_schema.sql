-- Create gap_assessments table
CREATE TABLE IF NOT EXISTS gap_assessments (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    section VARCHAR(255) NOT NULL,
    standard_ref VARCHAR(255) NOT NULL,
    assessment_question TEXT NOT NULL,
    compliance VARCHAR(50) NOT NULL DEFAULT 'Not Compliant',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maturity_assessments table
CREATE TABLE IF NOT EXISTS maturity_assessments (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    section VARCHAR(255) NOT NULL,
    standard_ref VARCHAR(255) NOT NULL,
    assessment_question TEXT NOT NULL,
    current_maturity_level VARCHAR(100),
    current_maturity_score INTEGER,
    current_maturity_comments TEXT,
    target_maturity_level VARCHAR(100),
    target_maturity_score INTEGER,
    target_maturity_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gap_category ON gap_assessments(category);
CREATE INDEX IF NOT EXISTS idx_gap_section ON gap_assessments(section);
CREATE INDEX IF NOT EXISTS idx_gap_compliance ON gap_assessments(compliance);
CREATE INDEX IF NOT EXISTS idx_maturity_category ON maturity_assessments(category);
CREATE INDEX IF NOT EXISTS idx_maturity_section ON maturity_assessments(section);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_gap_assessments_updated_at BEFORE UPDATE ON gap_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maturity_assessments_updated_at BEFORE UPDATE ON maturity_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

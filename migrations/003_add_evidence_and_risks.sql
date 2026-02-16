-- Create evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    file_type VARCHAR(100),
    gap_assessment_id INTEGER REFERENCES gap_assessments(id) ON DELETE SET NULL,
    maturity_assessment_id INTEGER,
    clause_reference VARCHAR(100),
    annex_reference VARCHAR(100),
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create risk_register table
CREATE TABLE IF NOT EXISTS risk_register (
    id SERIAL PRIMARY KEY,
    risk_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    likelihood VARCHAR(50),
    impact VARCHAR(50),
    risk_level VARCHAR(50),
    current_controls TEXT,
    treatment_plan TEXT,
    treatment_status VARCHAR(50) DEFAULT 'Open',
    owner VARCHAR(255),
    target_date DATE,
    gap_assessment_id INTEGER REFERENCES gap_assessments(id) ON DELETE SET NULL,
    annex_a_controls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_evidence_gap_assessment ON evidence(gap_assessment_id);
CREATE INDEX IF NOT EXISTS idx_evidence_clause ON evidence(clause_reference);
CREATE INDEX IF NOT EXISTS idx_risk_gap_assessment ON risk_register(gap_assessment_id);
CREATE INDEX IF NOT EXISTS idx_risk_status ON risk_register(treatment_status);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_register(risk_level);

-- Create triggers for updated_at
CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_register_updated_at BEFORE UPDATE ON risk_register
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

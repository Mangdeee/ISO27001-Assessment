package main

import (
	"fmt"
	"log"
)

// createTables creates all database tables if they don't exist
func (app *App) createTables() error {
	log.Println("Creating database tables if they don't exist...")

	// Create gap_assessments table
	_, err := app.DB.Exec(`
		CREATE TABLE IF NOT EXISTS gap_assessments (
			id SERIAL PRIMARY KEY,
			category VARCHAR(255) NOT NULL,
			section VARCHAR(255) NOT NULL,
			standard_ref VARCHAR(255) NOT NULL,
			assessment_question TEXT NOT NULL,
			compliance VARCHAR(50) NOT NULL,
			notes TEXT,
			target_date DATE,
			action_item_id INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating gap_assessments table: %v", err)
	}

	// Create maturity_assessments table
	_, err = app.DB.Exec(`
		CREATE TABLE IF NOT EXISTS maturity_assessments (
			id SERIAL PRIMARY KEY,
			category VARCHAR(255) NOT NULL,
			section VARCHAR(255) NOT NULL,
			standard_ref VARCHAR(255) NOT NULL,
			assessment_question TEXT NOT NULL,
			current_maturity_level VARCHAR(50),
			current_maturity_score INTEGER,
			current_maturity_comments TEXT,
			target_maturity_level VARCHAR(50),
			target_maturity_score INTEGER,
			target_maturity_comments TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating maturity_assessments table: %v", err)
	}

	// Create action_items table
	_, err = app.DB.Exec(`
		CREATE TABLE IF NOT EXISTS action_items (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			status VARCHAR(50) NOT NULL,
			priority VARCHAR(50) NOT NULL,
			assigned_to VARCHAR(255),
			due_date DATE,
			completed_date DATE,
			gap_assessment_id INTEGER REFERENCES gap_assessments(id),
			maturity_assessment_id INTEGER REFERENCES maturity_assessments(id),
			category VARCHAR(255),
			file_name VARCHAR(255),
			file_path TEXT,
			file_size INTEGER,
			file_type VARCHAR(100),
			clause_reference VARCHAR(255),
			annex_reference VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating action_items table: %v", err)
	}

	// Create evidence table
	_, err = app.DB.Exec(`
		CREATE TABLE IF NOT EXISTS evidence (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			file_name VARCHAR(255) NOT NULL,
			file_path TEXT NOT NULL,
			file_size INTEGER,
			file_type VARCHAR(100) NOT NULL,
			gap_assessment_id INTEGER REFERENCES gap_assessments(id),
			maturity_assessment_id INTEGER REFERENCES maturity_assessments(id),
			clause_reference VARCHAR(255),
			annex_reference VARCHAR(255),
			uploaded_by VARCHAR(255) NOT NULL,
			uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating evidence table: %v", err)
	}

	// Create risk_register table
	_, err = app.DB.Exec(`
		CREATE TABLE IF NOT EXISTS risk_register (
			id SERIAL PRIMARY KEY,
			risk_id VARCHAR(100) UNIQUE NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			category VARCHAR(255) NOT NULL,
			likelihood VARCHAR(50) NOT NULL,
			impact VARCHAR(50) NOT NULL,
			risk_level VARCHAR(50) NOT NULL,
			current_controls TEXT,
			treatment_plan TEXT,
			treatment_status VARCHAR(50) NOT NULL,
			owner VARCHAR(255) NOT NULL,
			target_date DATE,
			gap_assessment_id INTEGER REFERENCES gap_assessments(id),
			annex_a_controls TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating risk_register table: %v", err)
	}

	// Create indexes for better query performance
	_, err = app.DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_gap_assessments_standard_ref ON gap_assessments(standard_ref);
		CREATE INDEX IF NOT EXISTS idx_maturity_assessments_standard_ref ON maturity_assessments(standard_ref);
		CREATE INDEX IF NOT EXISTS idx_action_items_gap_id ON action_items(gap_assessment_id);
		CREATE INDEX IF NOT EXISTS idx_action_items_maturity_id ON action_items(maturity_assessment_id);
		CREATE INDEX IF NOT EXISTS idx_evidence_gap_id ON evidence(gap_assessment_id);
		CREATE INDEX IF NOT EXISTS idx_evidence_maturity_id ON evidence(maturity_assessment_id);
		CREATE INDEX IF NOT EXISTS idx_risk_register_gap_id ON risk_register(gap_assessment_id);
	`)
	if err != nil {
		return fmt.Errorf("error creating indexes: %v", err)
	}

	log.Println("Database tables created successfully")
	return nil
}

// InitializeDB creates tables and seeds data
func (app *App) InitializeDB() error {
	// Create tables first
	if err := app.createTables(); err != nil {
		return err
	}

	// Then seed data
	if err := app.SeedData(); err != nil {
		log.Printf("Warning: Data seeding encountered issues: %v", err)
		// Don't fail initialization if seeding fails
	}

	return nil
}

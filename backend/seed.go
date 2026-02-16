package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

// SeedData handles automatic seeding of initial data
func (app *App) SeedData() error {
	log.Println("Checking if database seeding is needed...")

	// Check if gap_assessments table has data
	hasGapData, err := app.hasData("gap_assessments")
	if err != nil {
		return fmt.Errorf("error checking gap_assessments: %v", err)
	}

	// Check if maturity_assessments table has data
	hasMaturityData, err := app.hasData("maturity_assessments")
	if err != nil {
		return fmt.Errorf("error checking maturity_assessments: %v", err)
	}

	// Seed gap assessments if table is empty
	if !hasGapData {
		log.Println("Seeding gap_assessments table...")
		if err := app.seedGapAssessments(); err != nil {
			log.Printf("Warning: Failed to seed gap_assessments: %v", err)
		} else {
			log.Println("Successfully seeded gap_assessments")
		}
	} else {
		log.Println("gap_assessments table already has data, skipping seed")
	}

	// Seed maturity assessments if table is empty
	if !hasMaturityData {
		log.Println("Seeding maturity_assessments table...")
		if err := app.seedMaturityAssessments(); err != nil {
			log.Printf("Warning: Failed to seed maturity_assessments: %v", err)
		} else {
			log.Println("Successfully seeded maturity_assessments")
		}
	} else {
		log.Println("maturity_assessments table already has data, skipping seed")
	}

	return nil
}

// hasData checks if a table has any rows
func (app *App) hasData(tableName string) (bool, error) {
	var count int
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName)
	err := app.DB.QueryRow(query).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// seedGapAssessments seeds gap assessment data from JSON file
func (app *App) seedGapAssessments() error {
	// Try multiple possible paths for the JSON file
	// Priority: current working directory (Docker container), then relative paths
	jsonPaths := []string{
		"./sample_gap_data.json",
		"sample_gap_data.json",
		"../sample_gap_data.json",
		"/app/sample_gap_data.json",
		"/root/sample_gap_data.json",
	}

	var jsonData []byte
	var err error
	var foundPath string

	for _, path := range jsonPaths {
		if jsonData, err = ioutil.ReadFile(path); err == nil {
			foundPath = path
			break
		}
	}

	if jsonData == nil {
		log.Printf("Warning: Could not find sample_gap_data.json in any of these paths: %v", jsonPaths)
		return fmt.Errorf("sample_gap_data.json not found")
	}

	log.Printf("Found gap data file at: %s", foundPath)

	var assessments []GapAssessment
	if err := json.Unmarshal(jsonData, &assessments); err != nil {
		return fmt.Errorf("error parsing JSON: %v", err)
	}

	// Use transaction for atomicity
	tx, err := app.DB.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO gap_assessments 
		(category, section, standard_ref, assessment_question, compliance, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
	`)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, assessment := range assessments {
		_, err := stmt.Exec(
			assessment.Category,
			assessment.Section,
			assessment.StandardRef,
			assessment.AssessmentQuestion,
			assessment.Compliance,
			assessment.Notes,
		)
		if err != nil {
			return fmt.Errorf("error inserting gap assessment: %v", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	log.Printf("Inserted %d gap assessments", len(assessments))
	return nil
}

// seedMaturityAssessments seeds maturity assessment data from JSON file
func (app *App) seedMaturityAssessments() error {
	// Try multiple possible paths for the JSON file
	// Priority: current working directory (Docker container), then relative paths
	jsonPaths := []string{
		"./sample_maturity_data.json",
		"sample_maturity_data.json",
		"../sample_maturity_data.json",
		"/app/sample_maturity_data.json",
		"/root/sample_maturity_data.json",
	}

	var jsonData []byte
	var err error
	var foundPath string

	for _, path := range jsonPaths {
		if jsonData, err = ioutil.ReadFile(path); err == nil {
			foundPath = path
			break
		}
	}

	if jsonData == nil {
		log.Printf("Warning: Could not find sample_maturity_data.json in any of these paths: %v", jsonPaths)
		return fmt.Errorf("sample_maturity_data.json not found")
	}

	log.Printf("Found maturity data file at: %s", foundPath)

	var assessments []MaturityAssessment
	if err := json.Unmarshal(jsonData, &assessments); err != nil {
		return fmt.Errorf("error parsing JSON: %v", err)
	}

	// Use transaction for atomicity
	tx, err := app.DB.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO maturity_assessments 
		(category, section, standard_ref, assessment_question, 
		 current_maturity_level, current_maturity_score, current_maturity_comments,
		 target_maturity_level, target_maturity_score, target_maturity_comments)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, assessment := range assessments {
		// Handle empty string scores - convert to NULL
		var currentScore *int
		var targetScore *int

		// Parse current_maturity_score
		if assessment.CurrentMaturityScore != nil {
			currentScore = assessment.CurrentMaturityScore
		} else if assessment.CurrentMaturityLevel != "" {
			// Try to extract score from level string if score is missing
			// This handles cases where score might be in the level string
			currentScore = nil
		}

		// Parse target_maturity_score
		if assessment.TargetMaturityScore != nil {
			targetScore = assessment.TargetMaturityScore
		}

		_, err := stmt.Exec(
			assessment.Category,
			assessment.Section,
			assessment.StandardRef,
			assessment.AssessmentQuestion,
			assessment.CurrentMaturityLevel,
			currentScore,
			assessment.CurrentMaturityComments,
			assessment.TargetMaturityLevel,
			targetScore,
			assessment.TargetMaturityComments,
		)
		if err != nil {
			return fmt.Errorf("error inserting maturity assessment: %v", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	log.Printf("Inserted %d maturity assessments", len(assessments))
	return nil
}

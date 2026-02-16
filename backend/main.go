package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type GapAssessment struct {
	ID                 int     `json:"id"`
	Category           string  `json:"category"`
	Section            string  `json:"section"`
	StandardRef        string  `json:"standard_ref"`
	AssessmentQuestion string  `json:"assessment_question"`
	Compliance         string  `json:"compliance"`
	Notes              string  `json:"notes"`
	TargetDate         *string `json:"target_date,omitempty"`
	ActionItemID       *int    `json:"action_item_id,omitempty"`
	CreatedAt          string  `json:"created_at"`
	UpdatedAt          string  `json:"updated_at"`
}

type ActionItem struct {
	ID                   int     `json:"id"`
	Title                string  `json:"title"`
	Description          string  `json:"description"`
	Status               string  `json:"status"`
	Priority             string  `json:"priority"`
	AssignedTo           string  `json:"assigned_to"`
	DueDate              *string `json:"due_date,omitempty"`
	CompletedDate        *string `json:"completed_date,omitempty"`
	GapAssessmentID      *int    `json:"gap_assessment_id,omitempty"`
	MaturityAssessmentID *int    `json:"maturity_assessment_id,omitempty"`
	Category             string  `json:"category"`
	FileName             *string `json:"file_name,omitempty"`
	FilePath             *string `json:"file_path,omitempty"`
	FileSize             *int    `json:"file_size,omitempty"`
	FileType             *string `json:"file_type,omitempty"`
	ClauseReference      *string `json:"clause_reference,omitempty"`
	AnnexReference       *string `json:"annex_reference,omitempty"`
	CreatedAt            string  `json:"created_at"`
	UpdatedAt            string  `json:"updated_at"`
}

type Evidence struct {
	ID                 int     `json:"id"`
	Title              string  `json:"title"`
	Description        string  `json:"description"`
	FileName           string  `json:"file_name"`
	FilePath            string  `json:"file_path"`
	FileSize           *int    `json:"file_size,omitempty"`
	FileType           string  `json:"file_type"`
	GapAssessmentID    *int    `json:"gap_assessment_id,omitempty"`
	MaturityAssessmentID *int  `json:"maturity_assessment_id,omitempty"`
	ClauseReference    string  `json:"clause_reference"`
	AnnexReference     string  `json:"annex_reference"`
	UploadedBy         string  `json:"uploaded_by"`
	UploadedAt         string  `json:"uploaded_at"`
	CreatedAt          string  `json:"created_at"`
	UpdatedAt          string  `json:"updated_at"`
}

type RiskRegister struct {
	ID                int     `json:"id"`
	RiskID            string  `json:"risk_id"`
	Title             string  `json:"title"`
	Description       string  `json:"description"`
	Category          string  `json:"category"`
	Likelihood        string  `json:"likelihood"`
	Impact            string  `json:"impact"`
	RiskLevel         string  `json:"risk_level"`
	CurrentControls   string  `json:"current_controls"`
	TreatmentPlan     string  `json:"treatment_plan"`
	TreatmentStatus   string  `json:"treatment_status"`
	Owner             string  `json:"owner"`
	TargetDate        *string `json:"target_date,omitempty"`
	GapAssessmentID   *int    `json:"gap_assessment_id,omitempty"`
	AnnexAControls    string  `json:"annex_a_controls"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

type MaturityAssessment struct {
	ID                      int    `json:"id"`
	Category                string `json:"category"`
	Section                 string `json:"section"`
	StandardRef             string `json:"standard_ref"`
	AssessmentQuestion      string `json:"assessment_question"`
	CurrentMaturityLevel    string `json:"current_maturity_level"`
	CurrentMaturityScore    *int   `json:"current_maturity_score"`
	CurrentMaturityComments string `json:"current_maturity_comments"`
	TargetMaturityLevel     string `json:"target_maturity_level"`
	TargetMaturityScore     *int   `json:"target_maturity_score"`
	TargetMaturityComments string `json:"target_maturity_comments"`
	CreatedAt               string `json:"created_at"`
	UpdatedAt               string `json:"updated_at"`
}

type App struct {
	DB *sql.DB
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func connectDB() (*sql.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "iso27001")
	password := getEnv("DB_PASSWORD", "iso27001_password")
	dbname := getEnv("DB_NAME", "iso27001_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("Successfully connected to database")
	return db, nil
}

func (app *App) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Gap Assessment Handlers
func (app *App) getGapAssessments(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT id, category, section, standard_ref, assessment_question, compliance, notes, target_date, action_item_id, created_at, updated_at FROM gap_assessments ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assessments []GapAssessment
	for rows.Next() {
		var a GapAssessment
		err := rows.Scan(&a.ID, &a.Category, &a.Section, &a.StandardRef, &a.AssessmentQuestion, &a.Compliance, &a.Notes, &a.TargetDate, &a.ActionItemID, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assessments = append(assessments, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessments)
}

func (app *App) getGapAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var a GapAssessment
	err = app.DB.QueryRow("SELECT id, category, section, standard_ref, assessment_question, compliance, notes, target_date, action_item_id, created_at, updated_at FROM gap_assessments WHERE id = $1", id).
		Scan(&a.ID, &a.Category, &a.Section, &a.StandardRef, &a.AssessmentQuestion, &a.Compliance, &a.Notes, &a.TargetDate, &a.ActionItemID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assessment not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

func (app *App) createGapAssessment(w http.ResponseWriter, r *http.Request) {
	var a GapAssessment
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := app.DB.QueryRow(
		"INSERT INTO gap_assessments (category, section, standard_ref, assessment_question, compliance, notes, target_date, action_item_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at, updated_at",
		a.Category, a.Section, a.StandardRef, a.AssessmentQuestion, a.Compliance, a.Notes, a.TargetDate, a.ActionItemID,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(a)
}

func (app *App) updateGapAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var a GapAssessment
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.DB.QueryRow(
		"UPDATE gap_assessments SET category = $1, section = $2, standard_ref = $3, assessment_question = $4, compliance = $5, notes = $6, target_date = $7, action_item_id = $8 WHERE id = $9 RETURNING id, created_at, updated_at",
		a.Category, a.Section, a.StandardRef, a.AssessmentQuestion, a.Compliance, a.Notes, a.TargetDate, a.ActionItemID, id,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assessment not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

func (app *App) deleteGapAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := app.DB.Exec("DELETE FROM gap_assessments WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Maturity Assessment Handlers
func (app *App) getMaturityAssessments(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT id, category, section, standard_ref, assessment_question, current_maturity_level, current_maturity_score, current_maturity_comments, target_maturity_level, target_maturity_score, target_maturity_comments, created_at, updated_at FROM maturity_assessments ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var assessments []MaturityAssessment
	for rows.Next() {
		var a MaturityAssessment
		err := rows.Scan(&a.ID, &a.Category, &a.Section, &a.StandardRef, &a.AssessmentQuestion, &a.CurrentMaturityLevel, &a.CurrentMaturityScore, &a.CurrentMaturityComments, &a.TargetMaturityLevel, &a.TargetMaturityScore, &a.TargetMaturityComments, &a.CreatedAt, &a.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		assessments = append(assessments, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(assessments)
}

func (app *App) getMaturityAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var a MaturityAssessment
	err = app.DB.QueryRow("SELECT id, category, section, standard_ref, assessment_question, current_maturity_level, current_maturity_score, current_maturity_comments, target_maturity_level, target_maturity_score, target_maturity_comments, created_at, updated_at FROM maturity_assessments WHERE id = $1", id).
		Scan(&a.ID, &a.Category, &a.Section, &a.StandardRef, &a.AssessmentQuestion, &a.CurrentMaturityLevel, &a.CurrentMaturityScore, &a.CurrentMaturityComments, &a.TargetMaturityLevel, &a.TargetMaturityScore, &a.TargetMaturityComments, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assessment not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

func (app *App) createMaturityAssessment(w http.ResponseWriter, r *http.Request) {
	var a MaturityAssessment
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := app.DB.QueryRow(
		"INSERT INTO maturity_assessments (category, section, standard_ref, assessment_question, current_maturity_level, current_maturity_score, current_maturity_comments, target_maturity_level, target_maturity_score, target_maturity_comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, created_at, updated_at",
		a.Category, a.Section, a.StandardRef, a.AssessmentQuestion, a.CurrentMaturityLevel, a.CurrentMaturityScore, a.CurrentMaturityComments, a.TargetMaturityLevel, a.TargetMaturityScore, a.TargetMaturityComments,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(a)
}

func (app *App) updateMaturityAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var a MaturityAssessment
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.DB.QueryRow(
		"UPDATE maturity_assessments SET category = $1, section = $2, standard_ref = $3, assessment_question = $4, current_maturity_level = $5, current_maturity_score = $6, current_maturity_comments = $7, target_maturity_level = $8, target_maturity_score = $9, target_maturity_comments = $10 WHERE id = $11 RETURNING id, created_at, updated_at",
		a.Category, a.Section, a.StandardRef, a.AssessmentQuestion, a.CurrentMaturityLevel, a.CurrentMaturityScore, a.CurrentMaturityComments, a.TargetMaturityLevel, a.TargetMaturityScore, a.TargetMaturityComments, id,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Assessment not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

func (app *App) deleteMaturityAssessment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := app.DB.Exec("DELETE FROM maturity_assessments WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Assessment not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Action Item Handlers
func (app *App) getActionItems(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT id, title, description, status, priority, assigned_to, due_date, completed_date, gap_assessment_id, maturity_assessment_id, category, created_at, updated_at FROM action_items ORDER BY due_date NULLS LAST, priority DESC, created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []ActionItem
	for rows.Next() {
		var item ActionItem
		err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.Status, &item.Priority, &item.AssignedTo, &item.DueDate, &item.CompletedDate, &item.GapAssessmentID, &item.MaturityAssessmentID, &item.Category, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (app *App) getActionItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item ActionItem
	err = app.DB.QueryRow("SELECT id, title, description, status, priority, assigned_to, due_date, completed_date, gap_assessment_id, maturity_assessment_id, category, file_name, file_path, file_size, file_type, clause_reference, annex_reference, created_at, updated_at FROM action_items WHERE id = $1", id).
		Scan(&item.ID, &item.Title, &item.Description, &item.Status, &item.Priority, &item.AssignedTo, &item.DueDate, &item.CompletedDate, &item.GapAssessmentID, &item.MaturityAssessmentID, &item.Category, &item.FileName, &item.FilePath, &item.FileSize, &item.FileType, &item.ClauseReference, &item.AnnexReference, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Action item not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (app *App) createActionItem(w http.ResponseWriter, r *http.Request) {
	var item ActionItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := app.DB.QueryRow(
		"INSERT INTO action_items (title, description, status, priority, assigned_to, due_date, completed_date, gap_assessment_id, maturity_assessment_id, category, file_name, file_path, file_size, file_type, clause_reference, annex_reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id, created_at, updated_at",
		item.Title, item.Description, item.Status, item.Priority, item.AssignedTo, item.DueDate, item.CompletedDate, item.GapAssessmentID, item.MaturityAssessmentID, item.Category, item.FileName, item.FilePath, item.FileSize, item.FileType, item.ClauseReference, item.AnnexReference,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (app *App) updateActionItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item ActionItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.DB.QueryRow(
		"UPDATE action_items SET title = $1, description = $2, status = $3, priority = $4, assigned_to = $5, due_date = $6, completed_date = $7, gap_assessment_id = $8, maturity_assessment_id = $9, category = $10, file_name = $11, file_path = $12, file_size = $13, file_type = $14, clause_reference = $15, annex_reference = $16 WHERE id = $17 RETURNING id, created_at, updated_at",
		item.Title, item.Description, item.Status, item.Priority, item.AssignedTo, item.DueDate, item.CompletedDate, item.GapAssessmentID, item.MaturityAssessmentID, item.Category, item.FileName, item.FilePath, item.FileSize, item.FileType, item.ClauseReference, item.AnnexReference, id,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Action item not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (app *App) deleteActionItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := app.DB.Exec("DELETE FROM action_items WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Action item not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Evidence Handlers
func (app *App) getEvidence(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT id, title, description, file_name, file_path, file_size, file_type, gap_assessment_id, maturity_assessment_id, clause_reference, annex_reference, uploaded_by, uploaded_at, created_at, updated_at FROM evidence ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []Evidence
	for rows.Next() {
		var item Evidence
		err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.FileName, &item.FilePath, &item.FileSize, &item.FileType, &item.GapAssessmentID, &item.MaturityAssessmentID, &item.ClauseReference, &item.AnnexReference, &item.UploadedBy, &item.UploadedAt, &item.CreatedAt, &item.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		items = append(items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (app *App) getEvidenceItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item Evidence
	err = app.DB.QueryRow("SELECT id, title, description, file_name, file_path, file_size, file_type, gap_assessment_id, maturity_assessment_id, clause_reference, annex_reference, uploaded_by, uploaded_at, created_at, updated_at FROM evidence WHERE id = $1", id).
		Scan(&item.ID, &item.Title, &item.Description, &item.FileName, &item.FilePath, &item.FileSize, &item.FileType, &item.GapAssessmentID, &item.MaturityAssessmentID, &item.ClauseReference, &item.AnnexReference, &item.UploadedBy, &item.UploadedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Evidence not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (app *App) createEvidence(w http.ResponseWriter, r *http.Request) {
	var item Evidence
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := app.DB.QueryRow(
		"INSERT INTO evidence (title, description, file_name, file_path, file_size, file_type, gap_assessment_id, maturity_assessment_id, clause_reference, annex_reference, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, uploaded_at, created_at, updated_at",
		item.Title, item.Description, item.FileName, item.FilePath, item.FileSize, item.FileType, item.GapAssessmentID, item.MaturityAssessmentID, item.ClauseReference, item.AnnexReference, item.UploadedBy,
	).Scan(&item.ID, &item.UploadedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (app *App) updateEvidence(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item Evidence
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.DB.QueryRow(
		"UPDATE evidence SET title = $1, description = $2, file_name = $3, file_path = $4, file_size = $5, file_type = $6, gap_assessment_id = $7, maturity_assessment_id = $8, clause_reference = $9, annex_reference = $10, uploaded_by = $11 WHERE id = $12 RETURNING id, uploaded_at, created_at, updated_at",
		item.Title, item.Description, item.FileName, item.FilePath, item.FileSize, item.FileType, item.GapAssessmentID, item.MaturityAssessmentID, item.ClauseReference, item.AnnexReference, item.UploadedBy, id,
	).Scan(&item.ID, &item.UploadedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Evidence not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

func (app *App) deleteEvidence(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := app.DB.Exec("DELETE FROM evidence WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Evidence not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Risk Register Handlers
func (app *App) getRisks(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT id, risk_id, title, description, category, likelihood, impact, risk_level, current_controls, treatment_plan, treatment_status, owner, target_date, gap_assessment_id, annex_a_controls, created_at, updated_at FROM risk_register ORDER BY risk_level DESC, created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var risks []RiskRegister
	for rows.Next() {
		var risk RiskRegister
		err := rows.Scan(&risk.ID, &risk.RiskID, &risk.Title, &risk.Description, &risk.Category, &risk.Likelihood, &risk.Impact, &risk.RiskLevel, &risk.CurrentControls, &risk.TreatmentPlan, &risk.TreatmentStatus, &risk.Owner, &risk.TargetDate, &risk.GapAssessmentID, &risk.AnnexAControls, &risk.CreatedAt, &risk.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		risks = append(risks, risk)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(risks)
}

func (app *App) getRisk(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var risk RiskRegister
	err = app.DB.QueryRow("SELECT id, risk_id, title, description, category, likelihood, impact, risk_level, current_controls, treatment_plan, treatment_status, owner, target_date, gap_assessment_id, annex_a_controls, created_at, updated_at FROM risk_register WHERE id = $1", id).
		Scan(&risk.ID, &risk.RiskID, &risk.Title, &risk.Description, &risk.Category, &risk.Likelihood, &risk.Impact, &risk.RiskLevel, &risk.CurrentControls, &risk.TreatmentPlan, &risk.TreatmentStatus, &risk.Owner, &risk.TargetDate, &risk.GapAssessmentID, &risk.AnnexAControls, &risk.CreatedAt, &risk.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Risk not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(risk)
}

func (app *App) createRisk(w http.ResponseWriter, r *http.Request) {
	var risk RiskRegister
	if err := json.NewDecoder(r.Body).Decode(&risk); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := app.DB.QueryRow(
		"INSERT INTO risk_register (risk_id, title, description, category, likelihood, impact, risk_level, current_controls, treatment_plan, treatment_status, owner, target_date, gap_assessment_id, annex_a_controls) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id, created_at, updated_at",
		risk.RiskID, risk.Title, risk.Description, risk.Category, risk.Likelihood, risk.Impact, risk.RiskLevel, risk.CurrentControls, risk.TreatmentPlan, risk.TreatmentStatus, risk.Owner, risk.TargetDate, risk.GapAssessmentID, risk.AnnexAControls,
	).Scan(&risk.ID, &risk.CreatedAt, &risk.UpdatedAt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(risk)
}

func (app *App) updateRisk(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var risk RiskRegister
	if err := json.NewDecoder(r.Body).Decode(&risk); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err = app.DB.QueryRow(
		"UPDATE risk_register SET risk_id = $1, title = $2, description = $3, category = $4, likelihood = $5, impact = $6, risk_level = $7, current_controls = $8, treatment_plan = $9, treatment_status = $10, owner = $11, target_date = $12, gap_assessment_id = $13, annex_a_controls = $14 WHERE id = $15 RETURNING id, created_at, updated_at",
		risk.RiskID, risk.Title, risk.Description, risk.Category, risk.Likelihood, risk.Impact, risk.RiskLevel, risk.CurrentControls, risk.TreatmentPlan, risk.TreatmentStatus, risk.Owner, risk.TargetDate, risk.GapAssessmentID, risk.AnnexAControls, id,
	).Scan(&risk.ID, &risk.CreatedAt, &risk.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Risk not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(risk)
}

func (app *App) deleteRisk(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := app.DB.Exec("DELETE FROM risk_register WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Risk not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Document Generation Handlers
func (app *App) generateClauseDocument(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	clauseRef := vars["clause"]
	
	assessmentData := make(map[string]interface{})

	// Prefer exact standard_ref matches first to avoid collisions like 6.1 matching 6.1.1/6.1.2/6.1.3
	exactDash := fmt.Sprintf("Clause-%s", clauseRef)
	exactSpace := fmt.Sprintf("Clause %s", clauseRef)
	like := "%" + clauseRef + "%"

	// Gap assessment (1 record)
	var gapID sql.NullInt64
	var category, section, standardRef, question, compliance, notes sql.NullString
	var targetDate sql.NullString
	err := app.DB.QueryRow(
		`SELECT id, category, section, standard_ref, assessment_question, compliance, notes, target_date
		 FROM gap_assessments
		 WHERE standard_ref = $1 OR standard_ref = $2 OR standard_ref ILIKE $3
		 ORDER BY
		   CASE
		     WHEN standard_ref = $1 THEN 0
		     WHEN standard_ref = $2 THEN 1
		     WHEN standard_ref ILIKE $3 THEN 2
		     ELSE 3
		   END,
		   length(standard_ref) ASC
		 LIMIT 1`,
		exactDash, exactSpace, like,
	).Scan(&gapID, &category, &section, &standardRef, &question, &compliance, &notes, &targetDate)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if standardRef.Valid {
		assessmentData["standard_ref"] = standardRef.String
	}
	if category.Valid {
		assessmentData["category"] = category.String
	}
	if section.Valid {
		assessmentData["section"] = section.String
	}
	if question.Valid {
		assessmentData["assessment_question"] = question.String
	}
	if compliance.Valid {
		assessmentData["compliance"] = compliance.String
	}
	if notes.Valid {
		assessmentData["notes"] = notes.String
	}
	if targetDate.Valid {
		assessmentData["target_date"] = targetDate.String
	}

	// Maturity assessment (optional, 1 record)
	{
		var mRef, mQuestion, currentLevel, currentComments, targetLevel, targetComments sql.NullString
		var currentScore, targetScore sql.NullInt64

		err := app.DB.QueryRow(
			`SELECT standard_ref, assessment_question,
			        current_maturity_level, current_maturity_score, current_maturity_comments,
			        target_maturity_level, target_maturity_score, target_maturity_comments
			 FROM maturity_assessments
			 WHERE standard_ref = $1 OR standard_ref = $2 OR standard_ref ILIKE $3
			 ORDER BY
			   CASE
			     WHEN standard_ref = $1 THEN 0
			     WHEN standard_ref = $2 THEN 1
			     WHEN standard_ref ILIKE $3 THEN 2
			     ELSE 3
			   END,
			   length(standard_ref) ASC
			 LIMIT 1`,
			exactDash, exactSpace, like,
		).Scan(&mRef, &mQuestion, &currentLevel, &currentScore, &currentComments, &targetLevel, &targetScore, &targetComments)
		if err != nil && err != sql.ErrNoRows {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if currentLevel.Valid {
			assessmentData["current_maturity_level"] = currentLevel.String
		}
		if currentScore.Valid {
			assessmentData["current_maturity_score"] = int(currentScore.Int64)
		}
		if currentComments.Valid {
			assessmentData["current_maturity_comments"] = currentComments.String
		}
		if targetLevel.Valid {
			assessmentData["target_maturity_level"] = targetLevel.String
		}
		if targetScore.Valid {
			assessmentData["target_maturity_score"] = int(targetScore.Int64)
		}
		if targetComments.Valid {
			assessmentData["target_maturity_comments"] = targetComments.String
		}
	}

	// Linked action items + evidence + risks (best-effort; keyed by gap_assessment_id when available)
	if gapID.Valid {
		gapAssessmentID := int(gapID.Int64)
		assessmentData["gap_assessment_id"] = gapAssessmentID

		// Action items
		{
			rows, err := app.DB.Query(
				`SELECT id, title, status, priority, assigned_to, due_date
				 FROM action_items
				 WHERE gap_assessment_id = $1 OR clause_reference ILIKE $2
				 ORDER BY due_date NULLS LAST, priority DESC, created_at DESC`,
				gapAssessmentID, like,
			)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
			var items []map[string]interface{}
			for rows.Next() {
				var id int
				var title, status, priority, assignedTo string
				var due sql.NullString
				if err := rows.Scan(&id, &title, &status, &priority, &assignedTo, &due); err != nil {
					continue
				}
				m := map[string]interface{}{
					"id":          id,
					"title":       title,
					"status":      status,
					"priority":    priority,
					"assigned_to": assignedTo,
				}
				if due.Valid {
					m["due_date"] = due.String
				}
				items = append(items, m)
			}
			if len(items) > 0 {
				assessmentData["action_items"] = items
			}
		}

		// Evidence
		{
			rows, err := app.DB.Query(
				`SELECT id, title, file_name, file_type, uploaded_by, uploaded_at
				 FROM evidence
				 WHERE gap_assessment_id = $1 OR clause_reference ILIKE $2
				 ORDER BY uploaded_at DESC`,
				gapAssessmentID, like,
			)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var items []map[string]interface{}
			for rows.Next() {
				var id int
				var title, fileName, fileType, uploadedBy string
				var uploadedAt string
				if err := rows.Scan(&id, &title, &fileName, &fileType, &uploadedBy, &uploadedAt); err != nil {
					continue
				}
				items = append(items, map[string]interface{}{
					"id":          id,
					"title":       title,
					"file_name":   fileName,
					"file_type":   fileType,
					"uploaded_by": uploadedBy,
					"uploaded_at": uploadedAt,
				})
			}
			if len(items) > 0 {
				assessmentData["evidence"] = items
			}
		}

		// Risks
		{
			rows, err := app.DB.Query(
				`SELECT risk_id, title, risk_level, treatment_status, owner, target_date
				 FROM risk_register
				 WHERE gap_assessment_id = $1
				 ORDER BY risk_level DESC, created_at DESC`,
				gapAssessmentID,
			)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var items []map[string]interface{}
			for rows.Next() {
				var riskID, title, level, status, owner string
				var target sql.NullString
				if err := rows.Scan(&riskID, &title, &level, &status, &owner, &target); err != nil {
					continue
				}
				m := map[string]interface{}{
					"risk_id":          riskID,
					"title":            title,
					"risk_level":       level,
					"treatment_status": status,
					"owner":            owner,
				}
				if target.Valid {
					m["target_date"] = target.String
				}
				items = append(items, m)
			}
			if len(items) > 0 {
				assessmentData["risks"] = items
			}
		}
	}
	
	document := generateClauseDocument(clauseRef, assessmentData)
	
	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"ISO27001-Clause-%s.md\"", clauseRef))
	w.Write([]byte(document))
}

func (app *App) generateSoA(w http.ResponseWriter, r *http.Request) {
	rows, err := app.DB.Query("SELECT standard_ref, assessment_question, compliance, notes FROM gap_assessments ORDER BY standard_ref")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var assessments []map[string]interface{}
	for rows.Next() {
		var ref, question, compliance, notes string
		if err := rows.Scan(&ref, &question, &compliance, &notes); err != nil {
			continue
		}
		assessments = append(assessments, map[string]interface{}{
			"standard_ref":        ref,
			"assessment_question": question,
			"compliance":          compliance,
			"notes":               notes,
		})
	}
	
	soa := generateSoA(assessments)
	
	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"ISO27001-Statement-of-Applicability-%s.md\"", time.Now().Format("2006-01-02")))
	w.Write([]byte(soa))
}

func (app *App) generateNotionExport(w http.ResponseWriter, r *http.Request) {
	// Get gap assessments
	gapRows, err := app.DB.Query("SELECT standard_ref, assessment_question, compliance, notes FROM gap_assessments ORDER BY standard_ref")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer gapRows.Close()
	
	var gapAssessments []map[string]interface{}
	for gapRows.Next() {
		var ref, question, compliance, notes string
		if err := gapRows.Scan(&ref, &question, &compliance, &notes); err != nil {
			continue
		}
		gapAssessments = append(gapAssessments, map[string]interface{}{
			"standard_ref":        ref,
			"assessment_question": question,
			"compliance":          compliance,
			"notes":               notes,
		})
	}
	
	// Get maturity assessments
	matRows, err := app.DB.Query("SELECT standard_ref, assessment_question, current_maturity_level, target_maturity_level FROM maturity_assessments ORDER BY standard_ref")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer matRows.Close()
	
	var maturityAssessments []map[string]interface{}
	for matRows.Next() {
		var ref, question, current, target string
		if err := matRows.Scan(&ref, &question, &current, &target); err != nil {
			continue
		}
		maturityAssessments = append(maturityAssessments, map[string]interface{}{
			"standard_ref":         ref,
			"assessment_question":  question,
			"current_maturity_level": current,
			"target_maturity_level":  target,
		})
	}
	
	export := generateNotionExport(gapAssessments, maturityAssessments)
	
	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"ISO27001-Notion-Export-%s.md\"", time.Now().Format("2006-01-02")))
	w.Write([]byte(export))
}

func (app *App) getAvailableClauses(w http.ResponseWriter, r *http.Request) {
	clauses := make([]string, 0, len(clauseTemplates))
	for clause := range clauseTemplates {
		clauses = append(clauses, clause)
	}
	// Return in a stable order for the UI
	sort.Slice(clauses, func(i, j int) bool {
		return compareClauseRefs(clauses[i], clauses[j]) < 0
	})
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"clauses": clauses,
		"count":   len(clauses),
	})
}

// compareClauseRefs performs a "natural" numeric sort for clause refs like 6.1.3 vs 6.1.12 vs 10.2.
// Returns -1 if a<b, 0 if equal, 1 if a>b.
func compareClauseRefs(a, b string) int {
	pa := parseClauseRef(a)
	pb := parseClauseRef(b)
	max := len(pa)
	if len(pb) > max {
		max = len(pb)
	}
	for i := 0; i < max; i++ {
		na := -1
		nb := -1
		if i < len(pa) {
			na = pa[i]
		}
		if i < len(pb) {
			nb = pb[i]
		}
		if na < nb {
			return -1
		}
		if na > nb {
			return 1
		}
	}
	// Stable fallback for non-numeric / identical numeric sequences
	return strings.Compare(a, b)
}

func parseClauseRef(s string) []int {
	parts := strings.Split(s, ".")
	out := make([]int, 0, len(parts))
	for _, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil {
			// keep sequence length stable but push non-numeric to end
			out = append(out, 1<<30)
			continue
		}
		out = append(out, n)
	}
	return out
}

func main() {
	db, err := connectDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	app := &App{DB: db}

	// Initialize database (create tables and seed data)
	if err := app.InitializeDB(); err != nil {
		log.Printf("Warning: Database initialization encountered issues: %v", err)
		// Don't fail startup if initialization fails - just log it
	}

	r := mux.NewRouter()

	// Gap Assessment routes
	r.HandleFunc("/api/gap-assessments", app.getGapAssessments).Methods("GET")
	r.HandleFunc("/api/gap-assessments", app.createGapAssessment).Methods("POST")
	r.HandleFunc("/api/gap-assessments/{id}", app.getGapAssessment).Methods("GET")
	r.HandleFunc("/api/gap-assessments/{id}", app.updateGapAssessment).Methods("PUT")
	r.HandleFunc("/api/gap-assessments/{id}", app.deleteGapAssessment).Methods("DELETE")

	// Maturity Assessment routes
	r.HandleFunc("/api/maturity-assessments", app.getMaturityAssessments).Methods("GET")
	r.HandleFunc("/api/maturity-assessments", app.createMaturityAssessment).Methods("POST")
	r.HandleFunc("/api/maturity-assessments/{id}", app.getMaturityAssessment).Methods("GET")
	r.HandleFunc("/api/maturity-assessments/{id}", app.updateMaturityAssessment).Methods("PUT")
	r.HandleFunc("/api/maturity-assessments/{id}", app.deleteMaturityAssessment).Methods("DELETE")

	// Action Items routes
	r.HandleFunc("/api/action-items", app.getActionItems).Methods("GET")
	r.HandleFunc("/api/action-items", app.createActionItem).Methods("POST")
	r.HandleFunc("/api/action-items/{id}", app.getActionItem).Methods("GET")
	r.HandleFunc("/api/action-items/{id}", app.updateActionItem).Methods("PUT")
	r.HandleFunc("/api/action-items/{id}", app.deleteActionItem).Methods("DELETE")

	// Evidence routes
	r.HandleFunc("/api/evidence", app.getEvidence).Methods("GET")
	r.HandleFunc("/api/evidence", app.createEvidence).Methods("POST")
	r.HandleFunc("/api/evidence/{id}", app.getEvidenceItem).Methods("GET")
	r.HandleFunc("/api/evidence/{id}", app.updateEvidence).Methods("PUT")
	r.HandleFunc("/api/evidence/{id}", app.deleteEvidence).Methods("DELETE")

	// Risk Register routes
	r.HandleFunc("/api/risks", app.getRisks).Methods("GET")
	r.HandleFunc("/api/risks", app.createRisk).Methods("POST")
	r.HandleFunc("/api/risks/{id}", app.getRisk).Methods("GET")
	r.HandleFunc("/api/risks/{id}", app.updateRisk).Methods("PUT")
	r.HandleFunc("/api/risks/{id}", app.deleteRisk).Methods("DELETE")

	// Document Generation routes
	r.HandleFunc("/api/generate/clause/{clause}", app.generateClauseDocument).Methods("GET")
	r.HandleFunc("/api/generate/soa", app.generateSoA).Methods("GET")
	r.HandleFunc("/api/generate/notion-export", app.generateNotionExport).Methods("GET")
	r.HandleFunc("/api/templates/clauses", app.getAvailableClauses).Methods("GET")

	// Health check
	r.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}).Methods("GET")

	handler := app.enableCORS(r)

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

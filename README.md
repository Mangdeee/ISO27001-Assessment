# ISO 27001 Assessment Dashboard

A web-based dashboard for managing ISO 27001 Gap Assessments and Maturity Assessments, replacing Excel-based templates with a modern, interactive interface.

## Features

- **Gap Assessment Management**: Track compliance status for ISO 27001 requirements
- **Maturity Assessment Management**: Monitor current and target maturity levels
- **Dashboard Overview**: View statistics and summaries
- **Full CRUD Operations**: Create, read, update, and delete assessments
- **Modern UI**: Built with React and Material-UI

## Architecture

- **Backend**: Go (Golang) with REST API
- **Frontend**: React with TypeScript and Material-UI
- **Database**: PostgreSQL
- **Containerization**: Docker Compose

## Prerequisites

- Docker and Docker Compose
- (Optional) Go 1.21+ and Node.js 18+ for local development

## Quick Start

1. **Clone or navigate to the project directory**

2. **Start all services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - PostgreSQL: localhost:5432

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Project Structure

```
.
├── backend/              # Go backend application
│   ├── main.go          # Main application file
│   ├── go.mod           # Go dependencies
│   └── Dockerfile       # Backend Docker image
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── types/       # TypeScript types
│   ├── package.json     # Node dependencies
│   └── Dockerfile       # Frontend Docker image
├── migrations/          # Database migrations
│   └── 001_init_schema.sql
├── docker-compose.yml   # Docker Compose configuration
└── README.md
```

## API Endpoints

### Gap Assessments
- `GET /api/gap-assessments` - Get all gap assessments
- `GET /api/gap-assessments/{id}` - Get a specific gap assessment
- `POST /api/gap-assessments` - Create a new gap assessment
- `PUT /api/gap-assessments/{id}` - Update a gap assessment
- `DELETE /api/gap-assessments/{id}` - Delete a gap assessment

### Maturity Assessments
- `GET /api/maturity-assessments` - Get all maturity assessments
- `GET /api/maturity-assessments/{id}` - Get a specific maturity assessment
- `POST /api/maturity-assessments` - Create a new maturity assessment
- `PUT /api/maturity-assessments/{id}` - Update a maturity assessment
- `DELETE /api/maturity-assessments/{id}` - Delete a maturity assessment

### Health Check
- `GET /api/health` - Check API health status

## Database Schema

### gap_assessments
- `id` (SERIAL PRIMARY KEY)
- `category` (VARCHAR)
- `section` (VARCHAR)
- `standard_ref` (VARCHAR)
- `assessment_question` (TEXT)
- `compliance` (VARCHAR) - Options: Fully Compliant, Partially Compliant, Not Compliant, Not Applicable
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### maturity_assessments
- `id` (SERIAL PRIMARY KEY)
- `category` (VARCHAR)
- `section` (VARCHAR)
- `standard_ref` (VARCHAR)
- `assessment_question` (TEXT)
- `current_maturity_level` (VARCHAR)
- `current_maturity_score` (INTEGER)
- `current_maturity_comments` (TEXT)
- `target_maturity_level` (VARCHAR)
- `target_maturity_score` (INTEGER)
- `target_maturity_comments` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Environment Variables

### Backend
- `DB_HOST` - Database host (default: postgres)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: iso27001)
- `DB_PASSWORD` - Database password (default: iso27001_password)
- `DB_NAME` - Database name (default: iso27001_db)
- `DB_SSLMODE` - SSL mode (default: disable)
- `PORT` - Backend server port (default: 8080)

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Development

### Backend Development
```bash
cd backend
go mod download
go run main.go
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Importing Data from Excel

To import data from the original Excel files, you can use the import script:

```bash
# Make sure the backend is running
docker-compose up -d backend

# Run the import script
python3 scripts/import_data.py \
  ISO27001-Gap-Assessment-Template-v1.1-allaboutgrc.com_.xlsx \
  ISO27001-Maturity-Assessment-Template-v1.1-allaboutgrc.com_.xlsx
```

Note: You may need to install required Python packages:
```bash
pip3 install openpyxl requests
```

## License

This project is for internal use.
# ISO27001-Assessment

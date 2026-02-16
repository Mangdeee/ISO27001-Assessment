# Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- (Optional) Python 3 with openpyxl and requests for data import

## Step 1: Start the Application

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Go backend API on port 8080
- React frontend on port 3000

## Step 2: Access the Dashboard

Open your browser and navigate to:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080/api

## Step 3: Import Data (Optional)

If you want to import data from your Excel files:

```bash
# Install Python dependencies (if not already installed)
pip3 install openpyxl requests

# Run the import script
python3 scripts/import_data.py \
  ISO27001-Gap-Assessment-Template-v1.1-allaboutgrc.com_.xlsx \
  ISO27001-Maturity-Assessment-Template-v1.1-allaboutgrc.com_.xlsx
```

## Step 4: Use the Dashboard

1. **Dashboard Tab**: View overview statistics
2. **Gap Assessment Tab**: Manage gap assessments
   - Click "Add Assessment" to create new entries
   - Click the edit icon to modify existing entries
   - Click the delete icon to remove entries
3. **Maturity Assessment Tab**: Manage maturity assessments
   - Same CRUD operations as Gap Assessment

## Troubleshooting

### Services won't start
- Check if ports 3000, 8080, and 5432 are available
- View logs: `docker-compose logs`

### Database connection errors
- Wait a few seconds for PostgreSQL to fully start
- Check backend logs: `docker-compose logs backend`

### Frontend can't connect to backend
- Ensure backend is running: `docker-compose ps`
- Check API health: http://localhost:8080/api/health

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Development Mode

For development with hot-reload:

### Backend
```bash
cd backend
go mod download
go run main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Make sure to update the database connection in backend if running locally.

# Environment Variables Setup Guide

This project uses environment variables for configuration. Each app has its own `.env.example` file that you should copy and customize.

## Quick Start

### Backend Setup

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   # Edit with your preferred editor
   nano .env
   # or
   vim .env
   ```

3. Required variables:
   - `DB_HOST` - Database host (localhost for local, postgres for Docker Compose)
   - `DB_PORT` - Database port (usually 5432)
   - `DB_USER` - Database username
   - `DB_PASSWORD` - Database password
   - `DB_NAME` - Database name
   - `DB_SSLMODE` - SSL mode (disable for local, require for production)
   - `PORT` - Backend server port (default: 8080)

### Frontend Setup

1. Copy the example file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```bash
   # Edit with your preferred editor
   nano .env
   # or
   vim .env
   ```

3. Required variables:
   - `VITE_API_URL` - Backend API URL (must start with `VITE_` for Vite to expose it)

## Environment-Specific Configurations

### Local Development

**Backend (.env):**
```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=iso27001
DB_PASSWORD=iso27001_password
DB_NAME=iso27001_db
DB_SSLMODE=disable
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080/api
```

### Docker Compose

**Backend (.env):**
```env
PORT=8080
DB_HOST=postgres
DB_PORT=5432
DB_USER=iso27001
DB_PASSWORD=iso27001_password
DB_NAME=iso27001_db
DB_SSLMODE=disable
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080/api
```

### CapRover / Production

**Backend (.env in CapRover app settings):**
```env
PORT=8080
DB_HOST=your-postgres-host.captain.yourdomain.com
DB_PORT=5432
DB_USER=iso27001
DB_PASSWORD=your-secure-password
DB_NAME=iso27001_db
DB_SSLMODE=require
```

**Frontend (.env in CapRover app settings):**
```env
VITE_API_URL=https://iso27001-backend.yourdomain.com/api
```

## Important Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Always commit `.env.example` files** - They serve as documentation
3. **Vite prefix requirement** - Frontend variables must start with `VITE_` to be accessible in the app
4. **Build-time variables** - Frontend environment variables are embedded at build time, not runtime
5. **Security** - Use strong passwords in production and never expose sensitive values

## Loading Environment Variables

### Backend (Go)
The backend automatically loads environment variables using `os.Getenv()`. No additional setup needed.

### Frontend (Vite)
Vite automatically loads variables from `.env` files that start with `VITE_`. Access them in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Backend can't connect to database
- Check `DB_HOST` matches your database location
- Verify `DB_PORT` is correct (5432 for PostgreSQL)
- Ensure `DB_USER` and `DB_PASSWORD` are correct
- For Docker Compose, use `postgres` as `DB_HOST`
- For local, use `localhost` as `DB_HOST`

### Frontend can't reach backend API
- Verify `VITE_API_URL` is correct
- Ensure the URL includes `/api` at the end
- Check CORS settings if using different domains
- Rebuild frontend after changing `.env` (Vite embeds vars at build time)

### Environment variables not working
- **Backend**: Restart the server after changing `.env`
- **Frontend**: Rebuild the app after changing `.env` (run `npm run build`)
- **Vite**: Ensure variables start with `VITE_` prefix
- Check for typos in variable names

## CapRover Environment Variables

When deploying to CapRover, set environment variables in the app settings:

1. Go to your app in CapRover dashboard
2. Click on "App Configs"
3. Scroll to "Environment Variables"
4. Add each variable as `KEY=value`
5. Save and restart the app

For frontend, remember that Vite variables are embedded at build time, so you may need to rebuild the Docker image with the correct environment variables.

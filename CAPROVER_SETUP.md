# CapRover CI/CD Setup Guide

This guide explains how to set up CI/CD with CapRover and GitHub Actions for the ISO 27001 platform.

## Prerequisites

1. **CapRover Server**: A CapRover instance running and accessible
2. **GitHub Repository**: This repository with GitHub Actions enabled
3. **CapRover Apps**: Two apps created in CapRover:
   - `iso27001-frontend`
   - `iso27001-backend`

## Step 1: Create Apps in CapRover

1. Log into your CapRover dashboard
2. Create two apps:
   - **App Name**: `iso27001-frontend`
   - **App Name**: `iso27001-backend`
3. For each app, note down:
   - App name
   - One-click app deployment token (found in App Settings → App Tokens)

## Step 2: Configure CapRover Registry (Optional but Recommended)

If you want to use CapRover's built-in registry:

1. Go to CapRover Settings → Docker Registry
2. Enable the registry and note the registry URL
3. Or use an external registry (Docker Hub, GitHub Container Registry, etc.)

## Step 3: Get CapRover API Token

1. In CapRover dashboard, go to **Settings** → **Authentication**
2. Copy your **Captain Auth Token** (or create a new one)

## Step 4: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `CAPROVER_SERVER` | Your CapRover server domain (without https://) | `captain.yourdomain.com` |
| `CAPROVER_APP_TOKEN` | Captain Auth Token from CapRover | `your-auth-token-here` |
| `CAPROVER_REGISTRY` | Docker registry URL | `registry.captain.yourdomain.com` or `docker.io` |
| `CAPROVER_REGISTRY_USERNAME` | Registry username | `your-username` |
| `CAPROVER_REGISTRY_PASSWORD` | Registry password/token | `your-password-or-token` |

### How to Get Values

- **CAPROVER_SERVER**: Your CapRover domain (e.g., `captain.example.com`)
- **CAPROVER_APP_TOKEN**: Found in CapRover Settings → Authentication
- **CAPROVER_REGISTRY**: 
  - If using CapRover registry: `registry.captain.yourdomain.com`
  - If using Docker Hub: `docker.io`
  - If using GitHub Container Registry: `ghcr.io`
- **CAPROVER_REGISTRY_USERNAME**: Your registry username
- **CAPROVER_REGISTRY_PASSWORD**: Your registry password or access token

## Step 5: Configure CapRover Apps

### Frontend App Configuration

1. In CapRover, go to `iso27001-frontend` app
2. **App Configs**:
   - **Port**: `80` (nginx serves on port 80)
   - **HTTP Port**: `80`
3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```
4. **Deployment Method**: 
   - Select "Deploy from GitHub"
   - Or use "Deploy from Dockerfile" (workflows will handle this)

### Backend App Configuration

1. In CapRover, go to `iso27001-backend` app
2. **App Configs**:
   - **Port**: `8080`
   - **HTTP Port**: `8080`
3. **Environment Variables**:
   ```
   DB_HOST=your-postgres-host
   DB_PORT=5432
   DB_USER=iso27001
   DB_PASSWORD=your-db-password
   DB_NAME=iso27001_db
   DB_SSLMODE=disable
   PORT=8080
   ```
4. **Deployment Method**: Same as frontend

## Step 6: Database Setup

You'll need a PostgreSQL database. Options:

1. **CapRover One-Click App**: Install PostgreSQL from CapRover's one-click apps
2. **External Database**: Use a managed PostgreSQL service
3. **Docker Container**: Run PostgreSQL in a separate CapRover app

Update the `DB_HOST` environment variable in the backend app accordingly.

## Step 7: Test the Workflow

1. Push a change to the `main` or `develop` branch
2. Go to GitHub Actions tab to see the workflow running
3. Check CapRover dashboard for deployment status

## Workflow Behavior

### Frontend Workflow (`frontend-deploy.yml`)
- Triggers on: push to `main`/`develop` when `frontend/` changes
- Builds: Node.js application with Vite
- Deploys: Docker image to CapRover

### Backend Workflow (`backend-deploy.yml`)
- Triggers on: push to `main`/`develop` when `backend/` changes
- Builds: Go application
- Deploys: Docker image to CapRover

### Full Stack Workflow (`full-stack-deploy.yml`)
- Triggers on: push to `main` when both frontend and backend change
- Runs both frontend and backend workflows in parallel

## Manual Deployment

You can also trigger deployments manually:

1. Go to GitHub Actions
2. Select the workflow
3. Click "Run workflow"
4. Choose branch and click "Run workflow"

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure Dockerfile paths are correct

### Deployment Fails
- Check CapRover app logs
- Verify app names match in CapRover and workflows
- Check CapRover API token is valid
- Verify registry credentials

### App Not Accessible
- Check CapRover app is running
- Verify domain/port configuration
- Check firewall rules
- Review CapRover app logs

## Alternative: Direct Git Deployment

If you prefer CapRover to build directly from Git (simpler but less control):

1. In CapRover app settings, select "Deploy from GitHub"
2. Connect your repository
3. Set branch to `main` or `develop`
4. CapRover will auto-deploy on push (no GitHub Actions needed)

However, the GitHub Actions approach gives you:
- Better CI/CD control
- Testing before deployment
- Image caching
- Deployment notifications

## Security Notes

- Never commit secrets to the repository
- Use GitHub Secrets for all sensitive data
- Rotate CapRover tokens regularly
- Use HTTPS for all CapRover communications
- Consider using CapRover's built-in SSL certificates

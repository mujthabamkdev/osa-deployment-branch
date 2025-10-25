# Railway Deployment Guide

## Overview
This guide covers deploying the Online Sharia Academy application to Railway, which supports monorepo deployments with automatic service detection.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with the code
- Railway CLI (optional, for advanced deployments)

## Project Structure
```
OSA/
├── railway.toml      # Monorepo service configuration
├── osa-backend/     # FastAPI backend
│   ├── railway.json
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
└── osa-frontend/    # Angular frontend
    ├── railway.json
    ├── package.json
    └── angular.json
```

## Railway Configuration Files

### Root Configuration (railway.json)
```json
{
  "services": {
    "backend": "railway.backend.json",
    "frontend": "railway.frontend.json"
  }
}
```

### Service-Specific Configurations
**Backend (railway.backend.json):**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

**Frontend (railway.frontend.json):**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build --prod"
  },
  "deploy": {
    "startCommand": "npx serve dist/osa-frontend -s -l $PORT"
  }
}
```

These files define the build and deployment configuration for each service in your monorepo.

### Backend Configuration (osa-backend/railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### Frontend Configuration (osa-frontend/railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build --prod"
  },
  "deploy": {
    "startCommand": "npx serve dist/osa-frontend -s -l $PORT"
  }
}
```

## Deployment Steps

### 1. Connect Repository to Railway
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select the `osa-deployment-branch` repository

### 2. Configure Services
Railway will automatically detect both services in the monorepo:

- **Backend Service**: `osa-backend/` directory
- **Frontend Service**: `osa-frontend/` directory

### 3. Database Setup
1. In your Railway project, add a PostgreSQL database:
   - Go to your project dashboard
   - Click "Add Plugin" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

### 4. Environment Variables
Set these environment variables in Railway (Project Settings → Variables):

#### Backend Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["https://your-frontend-domain.railway.app"]
ENVIRONMENT=production
```

#### Frontend Variables:
```
API_BASE_URL=https://your-backend-service.railway.app
```

### 5. Domain Configuration
1. Railway provides default domains for each service
2. Update the frontend's `API_BASE_URL` with the backend's Railway domain
3. Optionally configure custom domains in Railway dashboard

### 6. Deploy
1. Push your code to GitHub (already done)
2. Railway will automatically deploy both services
3. Monitor deployment logs in the Railway dashboard

## Service URLs
After deployment, you'll have:
- **Frontend**: `https://osa-frontend-production.up.railway.app`
- **Backend**: `https://osa-backend-production.up.railway.app`

## Troubleshooting

### Common Issues:
1. **"Script start.sh not found" or "Railpack could not determine how to build the app"**:
   - **Cause**: Railway is not detecting your monorepo structure properly
   - **Solution**: Ensure the following files exist in the root directory:
     - `railway.json` (main config)
     - `railway.backend.json` (backend service config)
     - `railway.frontend.json` (frontend service config)
   - **Check**: Verify the files contain the correct configurations as shown above

2. **Port Configuration**: Railway uses `$PORT` environment variable
3. **CORS Issues**: Update `CORS_ORIGINS` with the frontend URL
4. **Database Connection**: Ensure PostgreSQL plugin is added
5. **Build Failures**: Check Railway build logs for specific errors

### Environment Variables:
- Railway automatically provides `DATABASE_URL` for PostgreSQL
- Use Railway's built-in environment variable references: `${{Postgres.DATABASE_URL}}`

## Cost Optimization
- Railway has a generous free tier
- Services scale automatically based on usage
- Monitor usage in the Railway dashboard

## Next Steps
1. Test the deployed application
2. Configure custom domains if needed
3. Set up monitoring and alerts
4. Configure backup strategies for the database
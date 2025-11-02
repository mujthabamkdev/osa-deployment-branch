# OSA Platform - Railway Deployment

## 🚨 Important: Separate Service Deployment

This is a monorepo containing two services that must be deployed separately:

### Backend Service (`osa-backend/`)
- **Technology**: Python + FastAPI
- **Railway Root Directory**: `osa-backend`
- **Health Check**: `/health`

### Frontend Service (`osa-frontend/`)  
- **Technology**: Angular + Node.js
- **Railway Root Directory**: `osa-frontend`
- **Health Check**: `/`

## ⚠️ DO NOT Deploy from Root Directory

The root directory should NOT be deployed as a service. Deploy each subdirectory as separate Railway services.

## Deployment Steps

1. **Create Backend Service**:
   - New Railway service → Connect repo → Set root directory to `osa-backend`

2. **Create Frontend Service**:
   - New Railway service → Connect repo → Set root directory to `osa-frontend`

3. **Configure Environment Variables** as needed for each service

See `DEPLOYMENT_FIX.md` for detailed instructions.
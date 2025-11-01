# Railway Deployment Configuration Fixed

## Issues Fixed:

1. **Missing start.sh script** - Created root level start.sh (though not needed for proper monorepo deployment)
2. **Railway.toml configuration** - Updated for proper monorepo structure
3. **Build configurations** - Added nixpacks.toml files for both services
4. **Frontend build script** - Fixed production build command
5. **Added serve dependency** - For serving built Angular app

## Deployment Options:

### Option 1: Deploy as Separate Services (Recommended)

Deploy each service separately to Railway:

#### Backend Deployment:
1. Create a new Railway service
2. Connect to GitHub repo
3. Set **Root Directory** to `osa-backend`
4. Railway will auto-detect Python and use the configurations

#### Frontend Deployment:
1. Create another Railway service  
2. Connect to the same GitHub repo
3. Set **Root Directory** to `osa-frontend`
4. Railway will auto-detect Node.js and use the configurations

### Option 2: Monorepo Deployment (Complex)

If you want to deploy the entire monorepo as one project with multiple services, use the updated `railway.toml` configuration.

## Files Modified/Created:

### Root Level:
- ✅ `start.sh` - Created (fallback script)
- ✅ `railway.toml` - Updated for monorepo configuration

### Backend (`osa-backend/`):
- ✅ `nixpacks.toml` - Created for Python/FastAPI deployment
- ✅ `railway.json` - Updated with NIXPACKS builder
- ✅ `Procfile` - Already existed (good)
- ✅ Health endpoint - Already exists at `/health`

### Frontend (`osa-frontend/`):
- ✅ `nixpacks.toml` - Created for Node.js/Angular deployment  
- ✅ `railway.json` - Updated with proper build commands
- ✅ `package.json` - Added `serve` dependency and production build script

## Environment Variables Needed:

### Backend:
```
DATABASE_URL=your_postgres_connection_string
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend:
```
API_BASE_URL=https://your-backend-service.railway.app
```

## Next Steps:

1. **Option 1 (Recommended):** Deploy backend and frontend as separate Railway services
2. **Option 2:** Use the monorepo configuration with the updated railway.toml

The deployment should now work without the "Script start.sh not found" error!
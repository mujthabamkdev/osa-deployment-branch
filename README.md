# Online Sharia Academy (OSA) - Full Stack Application

This repository contains both the backend (FastAPI) and frontend (Angular) for the Online Sharia Academy platform.

## Backend (FastAPI)

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `CORS_ORIGINS`: Allowed origins for CORS

**Local Development:**
```bash
cd osa-backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**API Endpoints:**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users/me` - Get current user
- `GET/POST /api/v1/users` - Admin user management
- `GET/POST /api/v1/courses` - Course management (auth required)

## Frontend (Angular)

**Local Development:**
```bash
cd osa-frontend
npm install
npm start
```

## Deployment

See [SEVALA_DEPLOYMENT_GUIDE.md](SEVALA_DEPLOYMENT_GUIDE.md) for complete deployment instructions to Sevalla.

### Quick Deploy:
```bash
./prepare-sevalla-deployment.sh
git push --set-upstream origin main
```

Then create two services in Sevalla:
- Backend service (Python) pointing to `osa-backend/` directory
- Frontend service (Static/Node.js) pointing to `osa-frontend/` directory

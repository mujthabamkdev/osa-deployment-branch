OnlineShariaAcademy Backend (FastAPI)

Env: DATABASE_URL, JWT_SECRET, CORS_ORIGINS

Local:
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

API:
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/users/me
GET/POST /api/v1/users (admin)
GET/POST /api/v1/courses (auth/teacher)

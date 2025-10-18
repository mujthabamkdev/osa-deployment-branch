Setup:

Set envs: DATABASE_URL, JWT_SECRET, CORS_ORIGINS

Run migrations: alembic upgrade head
Deploy (Railway):

Attach Postgres, set envs, deploy with CMD in Dockerfile

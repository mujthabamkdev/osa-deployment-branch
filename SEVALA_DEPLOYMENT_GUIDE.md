# Sevalla Deployment Guide for OSA (Online Sharia Academy)

## Overview
This guide will help you deploy both the frontend and backend of the Online Sharia Academy to Sevalla.

## Prerequisites
- Sevalla account
- Domain configured in Sevalla (app.sevalla.com)
- Database (PostgreSQL recommended for production)

## Backend Deployment

### 1. Environment Setup
Before deploying, update the `.env.production` file with your actual values:

```bash
# Copy the production environment file
cp .env.production .env

# Edit with your actual values
nano .env
```

Required environment variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: A secure random string for JWT tokens
- `CORS_ORIGINS`: Your frontend domain (https://app.sevalla.com)

### 2. Deploy Backend to Sevalla

1. **Connect Repository**: Link your GitHub repository to Sevalla
2. **Create Backend Service**:
   - Service Type: `Python`
   - Build Command: `pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables: Copy from `.env.production`
3. **Database Setup**: Ensure your PostgreSQL database is accessible
4. **Deploy**: Sevalla will build and deploy your backend

### 3. Verify Backend Deployment
- Check the health endpoint: `https://your-backend-domain/api/v1/health`
- Test API endpoints with tools like Postman

## Frontend Deployment

### 1. Update API URL
The frontend is already configured to use `https://api.sevalla.com/api/v1` as the backend URL. If your backend is on a different domain, update:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-backend-domain/api/v1'
};
```

### 2. Deploy Frontend to Sevalla

1. **Create Frontend Service**:
   - Service Type: `Static Site` or `Node.js`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist/osa-frontend/browser`
   - If using Node.js: Start Command: `serve -s dist/osa-frontend/browser -l $PORT`

2. **Domain Configuration**:
   - Set custom domain to `app.sevalla.com`
   - Configure SSL certificate (Sevalla provides this automatically)

### 3. Environment Variables for Frontend
- `NODE_ENV`: `production`

## Database Migration

### For Production Database
1. Ensure your PostgreSQL database is set up
2. Run migrations: `alembic upgrade head`
3. Seed initial data if needed: `python seed_new_structure.py`

## Post-Deployment Checklist

### Backend
- [ ] API responds on health endpoint
- [ ] Database connection works
- [ ] CORS allows frontend domain
- [ ] Authentication endpoints work
- [ ] Admin endpoints accessible

### Frontend
- [ ] Site loads on app.sevalla.com
- [ ] API calls reach backend
- [ ] Authentication flow works
- [ ] Admin panel accessible
- [ ] Mobile responsive

### Security
- [ ] HTTPS enabled
- [ ] SECRET_KEY is secure and unique
- [ ] Database credentials are secure
- [ ] CORS properly configured
- [ ] No sensitive data in logs

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS_ORIGINS in backend environment
2. **API Connection Failed**: Verify API URL in frontend environment
3. **Database Connection**: Check DATABASE_URL format and credentials
4. **Build Failures**: Ensure all dependencies are in requirements.txt/package.json

### Logs
- Check Sevalla dashboard for build and runtime logs
- Use browser developer tools for frontend debugging
- Test API endpoints directly for backend issues

## Monitoring
- Set up health checks in Sevalla dashboard
- Monitor error rates and response times
- Set up alerts for downtime

## Updates
When deploying updates:
1. Push changes to your repository
2. Sevalla will automatically rebuild and redeploy
3. Test thoroughly in production
4. Monitor for any issues

## Support
- Sevalla Documentation: https://docs.sevalla.com
- Check deployment logs in Sevalla dashboard
- Contact Sevalla support for platform-specific issues
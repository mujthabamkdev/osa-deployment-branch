# Testing & Deployment Guide

## Pre-Migration Checklist

- [ ] Backend code compiles without errors
- [ ] All imports resolve correctly
- [ ] Database backup created (if applicable)
- [ ] No other migrations pending

## Step 1: Verify Code Compiles

```bash
cd osa-backend

# Check for syntax errors
python -m py_compile app/main.py
python -m py_compile app/models/*.py
python -m py_compile app/api/v1/routes/*.py
python -m py_compile app/schemas/course.py

# Or run the app to check imports
python -c "from app.main import app; print('✅ App imports successfully')"
```

## Step 2: Run Database Migration

```bash
cd osa-backend

# Check migration status
alembic current

# Run the migration
alembic upgrade head

# Verify migration
alembic current  # Should show: 0005_restructure_course_hierarchy
```

## Step 3: Populate Sample Data

```bash
cd osa-backend

# Run the seed script
python seed_new_structure.py
```

Expected output:
```
✅ Seed data created successfully!
✅ Course: Online Sharia
✅ Subjects: 5
✅ Total Lessons: 14
✅ Total Class Sessions: 42
```

## Step 4: Start Backend Server

```bash
cd osa-backend

# Start with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or with Python (if configured)
python app/main.py
```

Server should start with message:
```
INFO:     Application startup complete
```

## Step 5: Test API Endpoints

### 5.1 List All Subjects in a Course
```bash
curl -X GET "http://localhost:8000/api/v1/courses/1/subjects" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show:
{
  "subjects": [
    {
      "id": 1,
      "course_id": 1,
      "name": "Fiqh",
      "description": "Fiqh - Islamic studies subject",
      "order_in_course": 1,
      "lessons": [...]
    },
    // ... more subjects
  ]
}
```

### 5.2 Get Specific Subject with Lessons
```bash
curl -X GET "http://localhost:8000/api/v1/courses/1/subjects/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show subject with nested lessons array
```

### 5.3 List Lessons for a Subject
```bash
curl -X GET "http://localhost:8000/api/v1/courses/subjects/1/lessons" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should show all lessons (Class 1, Class 2, etc.)
```

### 5.4 Get Specific Lesson with Class Sessions
```bash
curl -X GET "http://localhost:8000/api/v1/courses/subjects/1/lessons/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should show lesson with class_sessions array
```

### 5.5 Create New Subject
```bash
curl -X POST "http://localhost:8000/api/v1/courses/1/subjects" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "name": "Arabic Grammar",
    "description": "Advanced Arabic Grammar",
    "instructor_id": 2,
    "order_in_course": 6
  }
```

### 5.6 Create New Lesson
```bash
curl -X POST "http://localhost:8000/api/v1/courses/subjects/1/lessons" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "subject_id": 1,
    "title": "Class 6",
    "description": "Advanced Fiqh",
    "order_in_subject": 6
  }
```

### 5.7 Create New Class Session
```bash
curl -X POST "http://localhost:8000/api/v1/courses/lessons/1/class-sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "lesson_id": 1,
    "session_date": "2024-02-01",
    "start_time": "14:00:00",
    "end_time": "15:00:00",
    "is_completed": false
  }
```

## Step 6: Database Verification

```bash
# Connect to database
sqlite3 dev.db  # or your database

# Check tables exist
.tables
# Should show: lessons, class_sessions, subjects (updated), etc.

# Check subjects now have course_id
SELECT id, name, course_id, order_in_course FROM subjects;

# Check lessons
SELECT id, subject_id, title, order_in_subject FROM lessons;

# Check class_sessions
SELECT id, lesson_id, session_date, start_time, end_time FROM class_sessions;

# Check chapters reference lessons
SELECT id, lesson_id, title FROM chapters;
```

## Step 7: Frontend Testing (After Backend is Working)

1. Start frontend server:
```bash
cd osa-frontend
npm start  # or ng serve
```

2. Navigate to course details page and verify:
   - ✅ Subjects display correctly
   - ✅ Can expand each subject
   - ✅ Lessons display as "Class 1", "Class 2", etc.
   - ✅ Can view class sessions for each lesson
   - ✅ Day-based schedule shows correctly

## Troubleshooting

### Migration Fails with FK Constraint Error
**Solution**: 
```bash
# Check data integrity
sqlite3 dev.db "SELECT * FROM subjects WHERE class_id IS NULL;"

# If needed, manually fix relationships before migration
```

### ClassSession not appearing in API
**Solution**: Verify imports in main.py include ClassSession:
```python
from app.models.session import Session, ClassSession
```

### Circular import errors
**Solution**: Ensure models have proper relationship definitions:
```python
# In lesson.py
class_sessions = relationship("ClassSession", back_populates="lesson")

# In session.py (ClassSession)
lesson = relationship("Lesson", back_populates="class_sessions")
```

### API returns 404 for new endpoints
**Solution**: Verify routes are registered in main.py:
```python
app.include_router(subjects.router, prefix="/api/v1/courses", tags=["Subjects"])
app.include_router(lessons.router, prefix="/api/v1/courses", tags=["Lessons"])
app.include_router(class_sessions.router, prefix="/api/v1/courses", tags=["Class Sessions"])
```

## Rollback Procedure (If Needed)

```bash
cd osa-backend

# Rollback migration
alembic downgrade -1

# Verify rolled back
alembic current  # Should show: 0004_add_source_to_attachment

# Or fully rollback to base
alembic downgrade base
```

## Performance Considerations

1. **Indexes**: Migration creates indexes on foreign keys
   - `ix_lessons_subject_id`
   - `ix_class_sessions_lesson_id`
   - `ix_chapters_lesson_id`
   - `ix_attachments_lesson_id`
   - `ix_subjects_course_id`

2. **Query Optimization**: Use nested schemas to avoid N+1 queries
   ```python
   # Good - loads full hierarchy
   return db.query(Course).filter(Course.id == 1).first()
   # Response includes all subjects→lessons→class_sessions

   # Avoid - multiple queries
   subjects = db.query(Subject).all()
   for subject in subjects:
       lessons = db.query(Lesson).filter(...)  # N queries
   ```

3. **Pagination**: Add for large datasets
   ```python
   # In routes
   @router.get("/", response_model=List[SubjectWithLessons])
   def list_subjects(
       course_id: int,
       skip: int = 0,
       limit: int = 100,
       db: Session = Depends(get_db)
   ):
       return db.query(Subject).filter(...).offset(skip).limit(limit).all()
   ```

## Success Criteria

- ✅ Migration runs without errors
- ✅ All tables created successfully
- ✅ Data migrated from old to new structure
- ✅ All API endpoints respond with 200 OK
- ✅ Frontend displays new hierarchy correctly
- ✅ Student can view courses → subjects → lessons → class sessions
- ✅ Teachers can create/edit subjects, lessons, and sessions

## Next Phase: Frontend Updates

After confirming backend is working:

1. Update `course-details.component.ts`
   - Fetch new course structure with subjects
   - Display subjects in expandable list

2. Update `course-details.component.html`
   - Show subject list with lesson counts
   - Expand to show lessons (Class 1, 2, 3, etc.)
   - Show class sessions under each lesson

3. Update `class-details.component`
   - Display day-based schedule
   - Show all class sessions with dates/times
   - Mark completed sessions

4. Update relevant services
   - Add CourseService methods for new endpoints
   - Create LessonService for lesson operations
   - Create ClassSessionService for session operations

## Support & Debugging

Enable debug logging:
```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check logs in backend console:
```
DEBUG:sqlalchemy.engine.Engine:SELECT ...
```

Use FastAPI docs for interactive testing:
- Visit: http://localhost:8000/docs
- Try endpoints interactively
- View request/response schemas

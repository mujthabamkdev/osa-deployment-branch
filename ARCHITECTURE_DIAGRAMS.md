# OSA Database Architecture - Visual Reference

## New Data Model Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         COURSE                                   │
│                  "Online Sharia"                                 │
│              (teacher_id: 1)                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
          ┌─────▼────┐ ┌────▼─────┐ ┌─▼──────┐
          │  SUBJECT  │ │ SUBJECT  │ │SUBJECT │
          │   Fiqh    │ │  Quran   │ │  Nahv  │
          │(id: 1)    │ │ (id: 2)  │ │(id: 3) │
          └─────┬────┘ └────┬─────┘ └─┬──────┘
                │           │        │
        ┌───────┼─────┐     │        └────────┐
        │       │     │     │                 │
    ┌───▼──┐ ┌──▼──┐ │  ┌──▼──┐          ┌──▼──┐
    │      │ │     │ │  │     │          │     │
    │Class1│ │Class2  │Class3 │          │Class1│
    │id:1  │ │id:2  │ │id:4  │          │id:7  │
    │      │ │      │ │      │          │      │
    └──┬──┘ └──┬──┘ │ └──┬──┘          └──┬──┘
       │       │    │    │                 │
   ┌───┴───┬──┴──┐  │  ┌─┴─┐           ┌──┴──┐
   │ Day1  │Day8 │  │  │...│           │Day1  │
   │2-3PM  │2-3PM   │     │           │      │
   │       │       │    │           │2-3PM │
   │       │       │    │           │      │
   └───────┴───────┘    │           └──────┘
   
   COURSE ──┬──> SUBJECT ──┬──> LESSON ──┬──> CLASSSESSION
            │              │             │
            │              ├──> CHAPTER  │
            │              │             └──> SESSIONCONTENT
            │              └──> ATTACHMENT
            │
            └──> [Other Subjects...]
```

## Table Structure

```
┌──────────────┐
│   COURSES    │
├──────────────┤
│ id (PK)      │
│ title        │
│ description  │
│ teacher_id──────┐
└──────────────┘   │
                   │
                   │
            ┌──────▼─────────┐
            │     USERS      │
            ├────────────────┤
            │ id (PK)        │
            │ email          │
            │ full_name      │
            │ role           │
            │ is_active      │
            └────────────────┘


┌──────────────────────┐          ┌──────────────────────┐
│    SUBJECTS          │          │    CHAPTERS          │
├──────────────────────┤          ├──────────────────────┤
│ id (PK)              │──────┐   │ id (PK)              │
│ course_id (FK)   ────┼───┐  │   │ lesson_id (FK)   ────┼───┐
│ name                 │   │  │   │ title                │   │
│ description          │   │  │   │ description          │   │
│ instructor_id ──┐    │   │  │   │ order                │   │
│ order_in_course │    │   │  │   └──────────────────────┘   │
└──────────────────────┘   │  │                              │
                          │  │   ┌──────────────────────┐   │
                          └──┼──>│    LESSONS           │   │
                             │   ├──────────────────────┤   │
                             │   │ id (PK)              │   │
                             │   │ subject_id (FK)  ◄───┼───┘
                             │   │ title                │
                             │   │ description          │
                             │   │ order_in_subject     │
                             │   └──────────────────────┘
                             │           │
                             └──────┬────┘
                                    │
                          ┌─────────▼─────────┐
                          │  CLASSSESSIONS    │
                          ├───────────────────┤
                          │ id (PK)           │
                          │ lesson_id (FK)────┼───┐
                          │ session_date      │   │
                          │ start_time        │   │
                          │ end_time          │   │
                          │ is_completed      │   │
                          └───────────────────┘   │
                                                  │
                              ┌───────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  SESSIONCONTENT    │
                    ├────────────────────┤
                    │ id (PK)            │
                    │ class_session_id FK│
                    │ title              │
                    │ content_type       │
                    │ content_url        │
                    │ order              │
                    └────────────────────┘
```

## Entity Relationship Diagram

```
      ┌─────────────┐
      │   COURSES   │
      └──────┬──────┘
             │
         1   │   N
             │
      ┌──────▼──────┐
      │   SUBJECTS  │
      └──────┬──────┘
             │
         1   │   N
             │
      ┌──────▼──────┐
      │   LESSONS   │
      └──────┬──────┘
             │
         1   │   N
             │
    ┌────────▼─────────┐
    │  CLASSSESSIONS   │
    └────────┬─────────┘
             │
         1   │   N
             │
  ┌──────────▼─────────┐
  │  SESSIONCONTENT    │
  └────────────────────┘

Also:
- COURSE has many CHAPTERS (through LESSONS)
- COURSE has many ATTACHMENTS
- LESSONS has many CHAPTERS
- LESSONS has many ATTACHMENTS
- CHAPTERS has many ATTACHMENTS
```

## API Endpoint Tree

```
/api/v1/courses/{course_id}
├── /subjects                           [GET, POST]
│   └── /{subject_id}                   [GET, PUT, DELETE]
│       └── /lessons                    [GET, POST]
│           └── /{lesson_id}            [GET, PUT, DELETE]
│               └── /class-sessions     [GET, POST]
│                   └── /{session_id}   [GET, PUT, DELETE]
```

## Data Migration Path

```
OLD STRUCTURE:
┌─────────────────────────┐
│ COURSES                 │
└────────┬────────────────┘
         │
         └──> CLASSES (year-based)
              ├─> SUBJECTS (class_id)
              │   └─> SESSIONS (subject_id)
              └─> ...

         │
         │ MIGRATION
         │
         ▼

NEW STRUCTURE:
┌─────────────────────────┐
│ COURSES                 │
└────────┬────────────────┘
         │
         └──> SUBJECTS (course_id) [MIGRATED]
              ├─> LESSONS (NEW)
              │   └─> CLASSSESSIONS [MIGRATED from SESSIONS]
              │       └─> SESSIONCONTENT [MIGRATED]
              └─> ...
```

## Sample Data Structure

```json
{
  "course": {
    "id": 1,
    "title": "Online Sharia",
    "teacher_id": 1,
    "subjects": [
      {
        "id": 1,
        "name": "Fiqh",
        "instructor_id": 2,
        "order_in_course": 1,
        "lessons": [
          {
            "id": 1,
            "title": "Class 1",
            "order_in_subject": 1,
            "class_sessions": [
              {
                "id": 1,
                "session_date": "2024-01-20",
                "start_time": "14:00",
                "end_time": "15:00",
                "is_completed": false
              },
              {
                "id": 2,
                "session_date": "2024-01-27",
                "start_time": "14:00",
                "end_time": "15:00",
                "is_completed": false
              }
            ]
          },
          {
            "id": 2,
            "title": "Class 2",
            "order_in_subject": 2,
            "class_sessions": [...]
          }
        ]
      },
      {
        "id": 2,
        "name": "Quran",
        "instructor_id": 3,
        "order_in_course": 2,
        "lessons": [...]
      }
    ]
  }
}
```

## Key Relationships Summary

| From | To | Type | FK Column | Comment |
|------|----|----- |-----------|---------|
| Course | Subject | 1:N | course_id | One course has many subjects |
| Subject | Lesson | 1:N | subject_id | One subject has many lessons |
| Lesson | ClassSession | 1:N | lesson_id | One lesson has many sessions |
| ClassSession | SessionContent | 1:N | class_session_id | One session has many content |
| Course | Chapter | 1:N | - | Through Lessons |
| Course | Attachment | 1:N | course_id | Can attach at course level |
| Lesson | Attachment | 1:N | lesson_id | Can attach at lesson level |
| Chapter | Attachment | 1:N | chapter_id | Can attach at chapter level |
| User | Course | 1:N | teacher_id | One teacher has many courses |
| User | Subject | 1:N | instructor_id | One instructor has many subjects |

## Database Indexes

```
ix_lessons_subject_id              Fast lesson lookup by subject
ix_class_sessions_lesson_id        Fast session lookup by lesson
ix_chapters_lesson_id              Fast chapter lookup by lesson
ix_attachments_lesson_id           Fast attachment lookup by lesson
ix_subjects_course_id              Fast subject lookup by course
```

## API Response Structure

### Hierarchical Response (Most Common)
```
GET /api/v1/courses/1
└── Response includes:
    ├── Course details
    └── subjects: [
        ├── Subject details
        └── lessons: [
            ├── Lesson details
            └── class_sessions: [
                └── ClassSession details
                ]
            ]
        ]
```

### Flat Response (For Performance)
```
GET /api/v1/courses/1/subjects/1/lessons
└── Response includes:
    └── lessons: [
        ├── Lesson 1
        ├── Lesson 2
        └── Lesson 3
        ]
```

## Day-Based Scheduling Example

```
Lesson: Fiqh Class 1

Week 1:
  Monday (Day 1)    → 2:00-3:00 PM  (ClassSession 1)
  Saturday (Day 6)  → 3:00-4:00 PM  (ClassSession 2)

Week 2:
  Monday (Day 8)    → 2:00-3:00 PM  (ClassSession 3)
  Saturday (Day 13) → 3:00-4:00 PM  (ClassSession 4)

...and so on

Each lesson can be scheduled on any days with any times.
This provides maximum flexibility for scheduling.
```

## Query Performance

```
Single Query Example:
SELECT * FROM courses WHERE id = 1
  WITH relationships loading:
  - subjects (5 joined)
  - lessons (14 joined)
  - class_sessions (42 joined)
  
Result: Full course hierarchy in ONE query
         No N+1 query problems
         Optimal for front-end consumption
```

---

This architecture provides:
✅ Clean hierarchical organization
✅ Flexible day-based scheduling
✅ Optimal query performance
✅ Easy to understand relationships
✅ Scalable to large datasets

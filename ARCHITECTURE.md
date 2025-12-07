# FocusFlow - Architecture & Design Document

## Overview

FocusFlow is a production-grade, multi-tenant Life Operating System designed for engineers to track learning goals, tasks, sprints, and daily habits with a dark, moody, Obsidian-inspired aesthetic.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React SPA     │ ─HTTP─> │  Django REST    │ ─SQL──> │   PostgreSQL    │
│   (Frontend)    │ <─JSON─ │     API         │ <─────  │    Database     │
│   Port 5173     │         │   Port 8000     │         │    Port 5432    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Technology Stack

#### Backend (Django)
- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Authentication**: SimpleJWT 5.3.1
- **Database**: PostgreSQL 15
- **CORS**: django-cors-headers 4.3.1
- **Server**: Gunicorn 21.2.0 (production)

#### Frontend (React)
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.11
- **Routing**: React Router DOM 6.21.1
- **HTTP Client**: Axios 1.6.5
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.307.0
- **Charts**: Recharts 2.10.3
- **Utilities**: date-fns 3.0.6, clsx 2.1.0

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 15 (Alpine)

## Data Model Architecture

### Entity Relationship Diagram

```
User (Django Auth)
  │
  │ 1:1
  ▼
Workspace (Multi-tenant boundary)
  │
  │ 1:N
  ├──> Goal (High-level objectives)
  │      │
  │      │ 1:N
  │      ├──> Sprint (2-week periods)
  │      │      │
  │      │      │ 1:N
  │      │      └──> Task (linked via sprint)
  │      │
  │      │ 1:N
  │      └──> Task (linked directly)
  │
  │ 1:N
  ├──> Task (Actionable items)
  │
  │ 1:N
  └──> DailyLog (Daily journal entries)
```

### Model Specifications

#### Workspace
- **Purpose**: Multi-tenant isolation boundary
- **Relationship**: 1:1 with User
- **Key Fields**: user, name, created_at, updated_at
- **Auto-creation**: Via Django signals on user registration

#### Goal
- **Purpose**: High-level objectives (e.g., "Master AWS")
- **Categories**: DEV, TRADING, LIFE (Enum)
- **Key Fields**:
  - title, description, category
  - progress_percentage (0-100, auto-calculated)
  - deadline, is_active
- **Methods**:
  - `update_progress()`: Auto-calculates based on task completion
- **Indexes**: workspace+category, workspace+is_active

#### Sprint
- **Purpose**: 2-week focused execution period
- **Relationship**: N:1 with Goal
- **Key Fields**:
  - name, start_date, end_date
  - description, is_active
- **Properties**:
  - `duration_days`: Calculated duration
  - `is_current`: Check if currently active
- **Indexes**: goal+is_active, start_date+end_date

#### Task
- **Purpose**: Actionable items with status tracking
- **Status**: TODO, IN_PROGRESS, DONE (Enum)
- **Priority**: HIGH, MEDIUM, LOW (Enum)
- **Key Fields**:
  - title, description, status, priority
  - estimated_hours, actual_hours
  - due_date, completed_at
- **Relationships**:
  - N:1 with Workspace (required)
  - N:1 with Goal (optional)
  - N:1 with Sprint (optional)
- **Auto-behaviors**:
  - Sets `completed_at` when status → DONE
  - Triggers goal progress update
- **Indexes**: Multiple for filtering efficiency

#### DailyLog
- **Purpose**: Date-based journal for mood, habits, focus
- **Key Fields**:
  - date (unique per workspace)
  - mood_score (1-10)
  - energy_level (1-10)
  - notes (TextField)
  - habits_completed (JSONField - list)
  - focus_hours (Decimal)
- **Constraint**: Unique together (workspace, date)
- **Indexes**: workspace+date

## API Architecture

### Authentication Flow

```
1. Register:  POST /api/auth/register/
              ↓
   Creates User + Workspace (auto)

2. Login:     POST /api/token/
              ↓
   Returns: { access, refresh }

3. Requests:  Authorization: Bearer <access_token>
              ↓
   Auto-refresh on 401

4. Refresh:   POST /api/token/refresh/
              ↓
   Returns: { access }
```

### Endpoint Structure

```
/api/
├── auth/
│   ├── register/          (POST - public)
│   └── me/                (GET - authenticated)
│
├── token/                 (POST - public, login)
├── token/refresh/         (POST - public)
├── token/verify/          (POST - authenticated)
│
├── workspaces/            (GET - read-only)
│
├── goals/
│   ├── /                  (GET, POST)
│   ├── /{id}/             (GET, PUT, PATCH, DELETE)
│   ├── /by_category/      (GET - custom)
│   └── /{id}/update_progress/ (POST - custom)
│
├── sprints/
│   ├── /                  (GET, POST)
│   ├── /{id}/             (GET, PUT, PATCH, DELETE)
│   └── /current/          (GET - custom)
│
├── tasks/
│   ├── /                  (GET, POST)
│   ├── /{id}/             (GET, PUT, PATCH, DELETE)
│   ├── /by_status/        (GET - custom)
│   └── /today/            (GET - custom)
│
├── daily-logs/
│   ├── /                  (GET, POST)
│   ├── /{id}/             (GET, PUT, PATCH, DELETE)
│   ├── /today/            (GET - custom)
│   └── /recent/           (GET - last 7 days)
│
└── dashboard/
    └── stats/             (GET - analytics)
```

### Permission System

```python
# Multi-level permission checks:

1. IsAuthenticated (DRF)
   └─> User must have valid JWT

2. BelongsToUserWorkspace (Custom)
   └─> Object must belong to user's workspace

3. Queryset Filtering
   └─> All queries auto-filtered by workspace
```

### Serializer Hierarchy

```
UserSerializer
├── Used in: Registration, Profile
└── Fields: id, username, email, first_name, last_name

GoalSerializer
├── Used in: List, Create, Update
├── Includes: category_display, task_count, sprint_count
└── Validates: deadline not in past

GoalDetailSerializer (extends GoalSerializer)
├── Used in: Retrieve (detail view)
└── Includes: Nested tasks (limited), sprints

Similar pattern for Sprint, Task, DailyLog
```

## Frontend Architecture

### Component Structure

```
src/
├── App.jsx                    # Router + Auth wrapper
├── main.jsx                   # Entry point
│
├── context/
│   └── AuthContext.jsx        # Global auth state
│
├── services/
│   └── api.js                 # Axios instance + API methods
│
├── components/
│   ├── Layout.jsx             # Sidebar + Outlet
│   └── LoadingSpinner.jsx     # Loading state
│
└── pages/
    ├── Login.jsx              # Public route
    ├── Register.jsx           # Public route
    ├── Dashboard.jsx          # Protected - Stats + Charts
    ├── Goals.jsx              # Protected - Goal management
    ├── Tasks.jsx              # Protected - Task management
    ├── Sprints.jsx            # Protected - Sprint management
    └── DailyLogs.jsx          # Protected - Daily logging
```

### Routing Strategy

```jsx
<Router>
  <Routes>
    // Public routes (redirect if authenticated)
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    // Protected routes (require authentication)
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="goals" element={<Goals />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="sprints" element={<Sprints />} />
      <Route path="daily-logs" element={<DailyLogs />} />
    </Route>
  </Routes>
</Router>
```

### State Management

```
AuthContext (React Context)
├── User state
├── Loading state
├── Error state
├── login()
├── register()
├── logout()
└── isAuthenticated

Component-level State (useState)
└── Each page manages its own data fetching
```

### API Service Layer

```javascript
// Centralized API configuration
api.js
├── Axios instance with baseURL
├── Request interceptor (adds JWT)
├── Response interceptor (auto-refresh)
└── Exported API modules:
    ├── authAPI
    ├── goalAPI
    ├── sprintAPI
    ├── taskAPI
    ├── dailyLogAPI
    └── dashboardAPI
```

## Security Architecture

### Authentication & Authorization

1. **JWT Token Flow**
   - Access token: 60 minutes
   - Refresh token: 7 days
   - Auto-rotation on refresh
   - Stored in localStorage

2. **Multi-Tenant Isolation**
   - All data filtered by workspace
   - Workspace auto-created on registration
   - Object-level permission checks
   - No cross-workspace data access

3. **CORS Configuration**
   - Allowed origins configurable
   - Credentials enabled
   - Preflight caching

### Input Validation

1. **Backend (Django)**
   - Model field validators
   - Serializer validation
   - Custom validation methods
   - SQL injection prevention (ORM)

2. **Frontend (React)**
   - Form validation
   - Required fields
   - Type checking
   - Error display

### Security Headers (Production)

```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
```

## Database Schema

### Indexes Strategy

```sql
-- Workspaces
CREATE INDEX idx_workspace_user ON workspaces(user_id);

-- Goals
CREATE INDEX idx_goal_workspace_category ON goals(workspace_id, category);
CREATE INDEX idx_goal_workspace_active ON goals(workspace_id, is_active);

-- Sprints
CREATE INDEX idx_sprint_goal_active ON sprints(goal_id, is_active);
CREATE INDEX idx_sprint_dates ON sprints(start_date, end_date);

-- Tasks
CREATE INDEX idx_task_workspace_status ON tasks(workspace_id, status);
CREATE INDEX idx_task_goal_status ON tasks(goal_id, status);
CREATE INDEX idx_task_sprint_status ON tasks(sprint_id, status);
CREATE INDEX idx_task_priority_status ON tasks(priority, status);

-- Daily Logs
CREATE UNIQUE INDEX idx_dailylog_workspace_date ON daily_logs(workspace_id, date);
```

### Performance Optimizations

1. **Database Connection Pooling**
   ```python
   CONN_MAX_AGE = 600  # 10 minutes
   ```

2. **Query Optimization**
   - Select related / Prefetch related
   - Pagination (20 items per page)
   - Limited nested serialization

3. **Caching Strategy** (Future)
   - Redis for session data
   - Cache frequently accessed stats
   - Cache dashboard analytics

## Design System

### Color Palette (Dark & Moody)

```css
Background:
  dark-bg: #0d0d0d       (Main background)
  dark-surface: #1a1a1a  (Cards, panels)
  dark-elevated: #262626 (Elevated elements)
  dark-border: #333333   (Borders)
  dark-hover: #2d2d2d    (Hover states)

Primary:
  primary: #8b5cf6       (Purple - main brand)
  primary-light: #a78bfa
  primary-dark: #7c3aed

Accents:
  blue: #3b82f6
  green: #10b981
  yellow: #f59e0b
  red: #ef4444

Text:
  primary: #f5f5f5       (Main text)
  secondary: #a3a3a3     (Secondary text)
  muted: #737373         (Muted text)
```

### Typography

```css
Font Family:
  sans: Inter, system-ui, sans-serif
  mono: JetBrains Mono, monospace

Font Weights:
  light: 300
  normal: 400
  medium: 500
  semibold: 600
  bold: 700
```

### Component Patterns

```css
.card              # Standard card with border
.card-elevated     # Elevated card with shadow
.btn-primary       # Primary action button
.btn-secondary     # Secondary button
.input-field       # Form input field
```

## Deployment Architecture

### Docker Compose Services

```yaml
services:
  db:           # PostgreSQL database
  backend:      # Django API server
  frontend:     # React dev server (Vite)

volumes:
  postgres_data    # Persistent database storage
  static_volume    # Static files
```

### Production Deployment (Recommended)

```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)            │
│    - SSL Termination                     │
│    - Static file serving                 │
│    - Rate limiting                       │
└────────┬──────────────────┬──────────────┘
         │                  │
         ▼                  ▼
   ┌─────────┐        ┌──────────┐
   │  React  │        │  Django  │
   │  Build  │        │ Gunicorn │
   │ (Static)│        │  Workers │
   └─────────┘        └────┬─────┘
                           │
                           ▼
                     ┌──────────┐
                     │PostgreSQL│
                     │  + Backup│
                     └──────────┘
```

## Monitoring & Logging

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {...},
        'core': {...},
    },
}
```

### Metrics to Monitor (Production)

1. **Application**
   - Request rate
   - Response time
   - Error rate (4xx, 5xx)
   - Active users

2. **Database**
   - Connection pool usage
   - Query performance
   - Slow queries
   - Database size

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

## Testing Strategy

### Backend Tests (Django)

```python
# Unit tests
python manage.py test

# Coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests (React)

```javascript
// Unit tests (to be added)
npm run test

// E2E tests (to be added)
npm run test:e2e
```

## Future Enhancements

### Phase 2 Features
- [ ] Habit tracking with streaks
- [ ] Advanced analytics dashboard
- [ ] Export data (CSV, JSON)
- [ ] Bulk task operations
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Email notifications
- [ ] Mobile responsive improvements

### Phase 3 Features
- [ ] Team collaboration
- [ ] Real-time updates (WebSockets)
- [ ] File attachments
- [ ] Third-party integrations (GitHub, Jira)
- [ ] AI-powered insights
- [ ] Mobile apps (React Native)

## Performance Benchmarks

### Target Metrics

- Page load: < 2s
- API response: < 200ms (p95)
- Database queries: < 50ms (average)
- Frontend bundle: < 500KB (gzipped)

## Conclusion

FocusFlow is architected as a production-ready, scalable application with clean separation of concerns, comprehensive security, and a modern tech stack. The multi-tenant architecture ensures data isolation, while the RESTful API design provides flexibility for future extensions.

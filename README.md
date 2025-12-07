# FocusFlow - Life Operating System for Engineers

A production-grade, multi-tenant web application for engineers to track learning goals, daily tasks, and habits with a dark, moody, Obsidian-like aesthetic.

## Tech Stack

### Backend
- **Django 5** - Python web framework
- **Django REST Framework** - API development
- **SimpleJWT** - JWT authentication
- **PostgreSQL** - Database

### Frontend
- **React 18** - UI library (Vite)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Recharts** - Charts and data visualization

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Features

### Data Models
- **Workspace**: One-to-one with User for multi-tenant isolation
- **Goal**: High-level objectives (Dev, Trading, Life categories)
- **Sprint**: 2-week execution periods linked to goals
- **Task**: Actionable items with status, priority, and time tracking
- **DailyLog**: Date-based journal for mood, habits, and focus hours

### API Endpoints
- Full CRUD operations for all models
- JWT-based authentication
- Dashboard statistics and analytics
- Filtering, searching, and pagination
- Workspace-level data isolation

### UI Features
- **Dark & Moody Theme**: Obsidian-inspired professional aesthetic
- **Enhanced Dashboard**: Welcome widget, activity heatmap, sprint progress, goal cards
- **Goal Manager**: Kanban board and list view with drag-and-drop workflow
- **Daily Journal**: Rich text editor, mood slider (1-10), energy tracking, habit checkboxes
- **Task Management**: Kanban columns (To Do, In Progress, Done) with priority filters
- **Responsive Layout**: Collapsible sidebar, mobile-friendly topbar, notification bell
- **Global State**: Context API for theme management and app-wide state
- **Protected Routes**: JWT authentication with auto-refresh

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd focusflow
```

2. Fix permissions (if needed):
```bash
./fix-permissions.sh
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build and start containers:
```bash
docker-compose up --build
```

**Quick Start Alternative**:
```bash
./start.sh
```

4. Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

### Default Credentials

The entrypoint script creates a default superuser:
- **Username**: admin
- **Password**: admin123

**⚠️ Change these credentials in production!**

## Development

### Backend (Django)

```bash
# Enter backend container
docker-compose exec backend bash

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
```

### Frontend (React)

```bash
# Enter frontend container
docker-compose exec frontend sh

# Install new package
npm install <package-name>

# Build for production
npm run build
```

## API Documentation

### Authentication

**Register**
```
POST /api/auth/register/
{
  "username": "user",
  "email": "user@example.com",
  "password": "password123",
  "password_confirm": "password123"
}
```

**Login**
```
POST /api/token/
{
  "username": "user",
  "password": "password123"
}
```

**Refresh Token**
```
POST /api/token/refresh/
{
  "refresh": "<refresh_token>"
}
```

### Core Endpoints

- `GET/POST /api/goals/` - List/Create goals
- `GET/PUT/PATCH/DELETE /api/goals/{id}/` - Goal detail operations
- `GET /api/goals/by_category/` - Goals grouped by category

- `GET/POST /api/tasks/` - List/Create tasks
- `GET/PUT/PATCH/DELETE /api/tasks/{id}/` - Task detail operations
- `GET /api/tasks/by_status/` - Tasks grouped by status
- `GET /api/tasks/today/` - Tasks due today

- `GET/POST /api/sprints/` - List/Create sprints
- `GET /api/sprints/current/` - Currently active sprints

- `GET/POST /api/daily-logs/` - List/Create daily logs
- `GET /api/daily-logs/today/` - Today's log
- `GET /api/daily-logs/recent/` - Last 7 days

- `GET /api/dashboard/stats/` - Comprehensive dashboard statistics

### Dashboard Stats Endpoint

The `/api/dashboard/stats/` endpoint returns comprehensive analytics:

```json
{
  "greeting": "Good morning",
  "user_name": "John",
  "total_goals": 5,
  "active_goals": 3,
  "total_tasks": 25,
  "completed_tasks": 10,
  "in_progress_tasks": 8,
  "pending_tasks": 7,
  "high_priority_pending": 3,
  "overdue_tasks": 2,
  "active_sprints_count": 1,
  "sprint_progress": [
    {
      "id": 1,
      "name": "Sprint 1",
      "goal_title": "Master AWS",
      "start_date": "2025-12-01",
      "end_date": "2025-12-14",
      "total_tasks": 10,
      "completed_tasks": 6,
      "progress_percentage": 60,
      "days_remaining": 7
    }
  ],
  "heatmap_data": [
    { "date": "2025-12-01", "count": 3, "level": 3 },
    { "date": "2025-12-02", "count": 5, "level": 4 }
  ],
  "avg_mood_score": 7.5,
  "total_focus_hours": 45.5,
  "completion_rate": 40
}
```

## Project Structure

```
focusflow/
├── backend/
│   ├── core/                   # Main Django app
│   │   ├── models.py          # Data models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API viewsets
│   │   ├── urls.py            # URL routing
│   │   ├── permissions.py     # Custom permissions
│   │   ├── signals.py         # Django signals
│   │   └── admin.py           # Admin configuration
│   ├── focusflow/             # Django project settings
│   │   ├── settings.py        # Configuration
│   │   └── urls.py            # Root URLs
│   ├── manage.py              # Django CLI
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Backend Docker config
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context (auth)
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind config
│   └── Dockerfile             # Frontend Docker config
└── docker-compose.yml         # Docker orchestration
```

## Design Philosophy

### Dark & Moody Theme
- High-contrast colors for readability
- Minimalist, professional data-heavy UI
- Obsidian-inspired color palette
- Focus on content over decoration

### Multi-Tenant Architecture
- Workspace-level data isolation
- One workspace per user
- All queries filtered by workspace
- Secure permission checks

### Production-Grade Code
- Comprehensive error handling
- Input validation and sanitization
- Proper database indexing
- Security best practices (OWASP)
- RESTful API design
- Code documentation

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **CORS**: Configured for development (adjust for production)
3. **Database**: PostgreSQL with parameterized queries
4. **Permissions**: Workspace-level isolation enforced
5. **Secrets**: Use environment variables (never commit .env)
6. **HTTPS**: Enable in production with proper certificates

## Production Deployment

### Environment Variables

Update these in production:
- `DEBUG=False`
- `DJANGO_SECRET_KEY` - Strong random key
- `ALLOWED_HOSTS` - Your domain
- `POSTGRES_PASSWORD` - Strong password
- `CORS_ALLOWED_ORIGINS` - Your frontend URL

### Additional Steps

1. Use a production WSGI server (Gunicorn already in requirements)
2. Set up Nginx as reverse proxy
3. Enable HTTPS with SSL certificates
4. Configure static file serving
5. Set up monitoring and logging
6. Regular database backups
7. Rate limiting and security headers

## Contributing

This is a complete production-grade starter template. Feel free to:
- Add new features (habits tracking, analytics, etc.)
- Enhance UI components
- Improve data visualizations
- Add tests
- Optimize performance

## License

MIT License - Free to use and modify

## Support

For issues and questions, please create an issue in the repository.

---

Built with by engineers, for engineers.

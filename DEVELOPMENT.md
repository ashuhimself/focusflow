# FocusFlow - Development Guide

## Getting Started

### Prerequisites

- Docker Desktop installed and running
- Git (for version control)
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and navigate to project**
   ```bash
   cd focusflow
   ```

2. **Quick start (easiest)**
   ```bash
   ./start.sh
   ```

3. **Manual start**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Build and start
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin
   - Login: admin / admin123 (change in production!)

## Development Workflow

### Backend Development (Django)

#### Project Structure
```
backend/
├── core/                    # Main application
│   ├── models.py           # Database models
│   ├── serializers.py      # API serializers
│   ├── views.py            # API views
│   ├── urls.py             # URL routing
│   ├── permissions.py      # Custom permissions
│   ├── signals.py          # Django signals
│   └── admin.py            # Admin configuration
├── focusflow/              # Project settings
│   ├── settings.py         # Configuration
│   └── urls.py             # Root URLs
└── manage.py               # Django CLI
```

#### Common Tasks

**Enter backend container**
```bash
docker-compose exec backend bash
```

**Create new migrations**
```bash
docker-compose exec backend python manage.py makemigrations
```

**Apply migrations**
```bash
docker-compose exec backend python manage.py migrate
```

**Create superuser**
```bash
docker-compose exec backend python manage.py createsuperuser
```

**Django shell**
```bash
docker-compose exec backend python manage.py shell
```

**Run tests**
```bash
docker-compose exec backend python manage.py test
```

**View logs**
```bash
docker-compose logs -f backend
```

#### Adding a New Model

1. Edit `backend/core/models.py`
   ```python
   class MyModel(models.Model):
       workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
       name = models.CharField(max_length=255)
       # ... more fields
   ```

2. Create serializer in `backend/core/serializers.py`
   ```python
   class MyModelSerializer(serializers.ModelSerializer):
       class Meta:
           model = MyModel
           fields = '__all__'
   ```

3. Create viewset in `backend/core/views.py`
   ```python
   class MyModelViewSet(viewsets.ModelViewSet):
       serializer_class = MyModelSerializer
       permission_classes = [IsAuthenticated, BelongsToUserWorkspace]

       def get_queryset(self):
           return MyModel.objects.filter(workspace=self.request.user.workspace)
   ```

4. Register in `backend/core/urls.py`
   ```python
   router.register(r'mymodels', views.MyModelViewSet, basename='mymodel')
   ```

5. Add to admin in `backend/core/admin.py`
   ```python
   @admin.register(MyModel)
   class MyModelAdmin(admin.ModelAdmin):
       list_display = ['name', 'workspace', 'created_at']
   ```

6. Create and run migrations
   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

### Frontend Development (React)

#### Project Structure
```
frontend/src/
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
├── index.css               # Global styles
├── context/
│   └── AuthContext.jsx     # Authentication state
├── services/
│   └── api.js              # API client
├── components/
│   ├── Layout.jsx          # App layout
│   └── LoadingSpinner.jsx  # Reusable components
└── pages/
    ├── Login.jsx           # Login page
    ├── Register.jsx        # Registration
    ├── Dashboard.jsx       # Dashboard
    ├── Goals.jsx           # Goals management
    ├── Tasks.jsx           # Tasks management
    ├── Sprints.jsx         # Sprints management
    └── DailyLogs.jsx       # Daily logs
```

#### Common Tasks

**Enter frontend container**
```bash
docker-compose exec frontend sh
```

**Install new package**
```bash
docker-compose exec frontend npm install <package-name>
```

**View logs**
```bash
docker-compose logs -f frontend
```

**Build for production**
```bash
docker-compose exec frontend npm run build
```

#### Adding a New Page

1. Create page component in `frontend/src/pages/MyPage.jsx`
   ```jsx
   import { useState, useEffect } from 'react';

   const MyPage = () => {
     const [data, setData] = useState([]);

     useEffect(() => {
       // Fetch data
     }, []);

     return (
       <div className="p-8">
         <h1 className="text-3xl font-bold">My Page</h1>
         {/* Content */}
       </div>
     );
   };

   export default MyPage;
   ```

2. Add route in `frontend/src/App.jsx`
   ```jsx
   import MyPage from './pages/MyPage';

   // In routes:
   <Route path="mypage" element={<MyPage />} />
   ```

3. Add navigation link in `frontend/src/components/Layout.jsx`
   ```jsx
   const navigation = [
     // ... existing items
     { name: 'My Page', href: '/mypage', icon: IconComponent },
   ];
   ```

#### Adding a New API Method

Edit `frontend/src/services/api.js`:

```javascript
export const myModelAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/mymodels/', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/mymodels/', data);
    return response.data;
  },

  // ... more methods
};
```

### Docker Commands

**Start services**
```bash
docker-compose up
```

**Start in background**
```bash
docker-compose up -d
```

**Stop services**
```bash
docker-compose down
```

**Rebuild containers**
```bash
docker-compose up --build
```

**View logs**
```bash
docker-compose logs -f
docker-compose logs -f backend  # specific service
```

**Remove all data (reset)**
```bash
docker-compose down -v  # Removes volumes (DATABASE WILL BE DELETED!)
```

**Execute command in container**
```bash
docker-compose exec backend <command>
docker-compose exec frontend <command>
```

## Database Management

### Accessing PostgreSQL

**Via Docker**
```bash
docker-compose exec db psql -U focusflow -d focusflow
```

**Common SQL commands**
```sql
-- List tables
\dt

-- Describe table
\d tablename

-- Query data
SELECT * FROM goals LIMIT 10;

-- Exit
\q
```

### Backup Database

```bash
docker-compose exec db pg_dump -U focusflow focusflow > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U focusflow focusflow < backup.sql
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Testing

### Backend Tests

**Run all tests**
```bash
docker-compose exec backend python manage.py test
```

**Run specific app tests**
```bash
docker-compose exec backend python manage.py test core
```

**With coverage**
```bash
docker-compose exec backend coverage run manage.py test
docker-compose exec backend coverage report
```

### API Testing

**Using curl**
```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get goals (with token)
curl http://localhost:8000/api/goals/ \
  -H "Authorization: Bearer <your-token>"
```

**Using httpie** (install: `brew install httpie`)
```bash
# Login
http POST localhost:8000/api/token/ username=admin password=admin123

# Get goals
http localhost:8000/api/goals/ "Authorization: Bearer <token>"
```

## Code Style

### Backend (Python)

**Format code with black**
```bash
docker-compose exec backend black .
```

**Check with flake8**
```bash
docker-compose exec backend flake8 .
```

**Sort imports with isort**
```bash
docker-compose exec backend isort .
```

### Frontend (JavaScript)

**Lint code**
```bash
docker-compose exec frontend npm run lint
```

## Environment Variables

### Backend (.env)
```bash
DEBUG=True                              # Set to False in production
DJANGO_SECRET_KEY=your-secret-key       # Change in production
POSTGRES_DB=focusflow
POSTGRES_USER=focusflow
POSTGRES_PASSWORD=focusflow             # Change in production
POSTGRES_HOST=db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api
```

## Troubleshooting

### Backend won't start

**Check if database is ready**
```bash
docker-compose logs db
```

**Check migrations**
```bash
docker-compose exec backend python manage.py showmigrations
```

**Reset database**
```bash
docker-compose down -v
docker-compose up
```

### Frontend won't start

**Clear node_modules**
```bash
docker-compose down
docker volume ls | grep node_modules
docker volume rm <volume-name>
docker-compose up --build
```

**Check logs**
```bash
docker-compose logs -f frontend
```

### Port already in use

**Check what's using the port**
```bash
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database
```

**Kill the process**
```bash
kill -9 <PID>
```

**Or change ports in docker-compose.yml**

### CORS errors

**Check CORS settings in backend/focusflow/settings.py**
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    # Add your frontend URL
]
```

### Authentication issues

**Check token expiry**
```bash
# JWT tokens expire in 60 minutes (access)
# 7 days (refresh)
```

**Clear localStorage**
```javascript
// In browser console
localStorage.clear()
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Change `DJANGO_SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Change database password
- [ ] Configure HTTPS
- [ ] Set up static file serving
- [ ] Configure email backend
- [ ] Set up monitoring
- [ ] Set up backups
- [ ] Review security settings

### Building for Production

**Frontend**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend**
```bash
python manage.py collectstatic --noinput
```

### Docker Production Build

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  db:
    # Same as dev

  backend:
    build:
      context: ./backend
    command: gunicorn focusflow.wsgi:application --bind 0.0.0.0:8000
    environment:
      - DEBUG=False
      # ... production settings

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
```

## Useful Resources

### Documentation
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- React: https://react.dev/
- Tailwind: https://tailwindcss.com/
- Docker: https://docs.docker.com/

### Tools
- Postman: API testing
- pgAdmin: PostgreSQL GUI
- React DevTools: Browser extension
- Django Debug Toolbar: Development

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## Getting Help

- Check the README.md for overview
- Check ARCHITECTURE.md for design details
- Review code comments
- Check Django/React documentation
- Search Stack Overflow

---

Happy coding!

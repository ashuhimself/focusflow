# BreathingMonk

A comprehensive learning platform built for ambitious learners to master new skills through structured courses, progress tracking, and interactive learning experiences.

## Live Application

- **Website**: [https://breathingmonk.com](https://breathingmonk.com)
- **API**: [https://breathingmonk.com/api](https://breathingmonk.com/api)
- **Admin Panel**: [https://breathingmonk.com/admin](https://breathingmonk.com/admin)

## Tech Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Server**: Gunicorn (Production)
- **Database**: PostgreSQL 15
- **Authentication**: Django Token Authentication

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Infrastructure
- **Hosting**: AWS EC2 (Ubuntu)
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions

## Features

- User authentication and authorization
- Course management system
- Progress tracking dashboard
- Responsive design for all devices
- Secure HTTPS with auto-renewal SSL certificates
- Automated deployment pipeline
- Admin dashboard for content management

## Project Structure

```
focusflow/
├── backend/                 # Django backend
│   ├── api/                # REST API endpoints
│   ├── focusflow/          # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── nginx/                  # Nginx configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── focusflow.conf
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
├── docker-compose.prod.yml # Production Docker setup
├── docker-compose.yml      # Development Docker setup
├── deploy.sh              # Deployment script
└── .env.production        # Production environment template
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashuhimself/focusflow.git
   cd focusflow
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start development servers**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

### Running Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### Creating a Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Collecting Static Files

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

## Production Deployment

### Manual Deployment

SSH into the EC2 instance and run:

```bash
ssh -i ~/.ssh/focusflow-key.pem ubuntu@3.236.173.60
cd ~/focusflow
git pull origin main
./deploy.sh
```

### Automated Deployment

The project uses GitHub Actions for automated deployment. Every push to the `main` branch triggers:

1. SSH connection to EC2
2. Code pull from GitHub
3. Docker container rebuild
4. Service restart
5. Deployment verification

For detailed setup instructions, see [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)

## Environment Variables

### Required Variables

```bash
# Django
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=breathingmonk.com,www.breathingmonk.com

# Database
POSTGRES_DB=focusflow
POSTGRES_USER=focusflow
POSTGRES_PASSWORD=your-password

# Frontend
VITE_API_URL=https://breathingmonk.com/api

# CORS/CSRF
CORS_ALLOWED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com
CSRF_TRUSTED_ORIGINS=https://breathingmonk.com,https://www.breathingmonk.com
```

For production, sensitive values are managed via GitHub Secrets.

## Docker Services

### Production Services

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

### Individual Service Logs

```bash
# Backend logs
docker logs focusflow_backend --tail 100 -f

# Nginx logs
docker logs focusflow_nginx --tail 100 -f

# Database logs
docker logs focusflow_db --tail 100 -f
```

## SSL Certificate

SSL certificates are automatically managed by Let's Encrypt via Certbot:

- **Domains**: breathingmonk.com, www.breathingmonk.com
- **Provider**: Let's Encrypt
- **Auto-Renewal**: Enabled (renews every 12 hours via certbot container)
- **Expires**: March 7, 2026

### Manual Certificate Renewal

```bash
docker run --rm -v /home/ubuntu/focusflow/certbot/conf:/etc/letsencrypt \
  -v /home/ubuntu/focusflow/certbot/www:/var/www/certbot \
  certbot/certbot renew
```

## Security Features

- HTTPS/TLS encryption with Let's Encrypt
- HTTP to HTTPS automatic redirect
- HSTS (HTTP Strict Transport Security)
- CSRF protection
- CORS configuration
- Secure cookie settings
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Production mode (DEBUG=False)

## API Documentation

### Authentication

```bash
# Login
POST /api/login/
{
  "username": "user@example.com",
  "password": "password"
}

# Response
{
  "token": "your-auth-token",
  "user": {...}
}
```

### Authenticated Requests

Include the token in the Authorization header:

```bash
Authorization: Token your-auth-token
```

## Troubleshooting

### Site Not Loading

```bash
# Check nginx
docker logs focusflow_nginx --tail 50

# Check backend
docker logs focusflow_backend --tail 50

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check database health
docker exec focusflow_db pg_isready -U focusflow

# Access database
docker exec -it focusflow_db psql -U focusflow -d focusflow
```

### Backend Errors

```bash
# Check migrations
docker exec focusflow_backend python manage.py showmigrations

# Run migrations
docker exec focusflow_backend python manage.py migrate
```

For more troubleshooting guidance, see [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Workflow

1. Make changes locally
2. Test with `docker-compose up`
3. Commit and push to GitHub
4. GitHub Actions automatically deploys to production
5. Verify at https://breathingmonk.com

## License

This project is proprietary software.

## Support

For issues or questions:
- Check the [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- Review container logs
- Verify environment variables
- Ensure EC2 instance is accessible

## Contact

- **Website**: [breathingmonk.com](https://breathingmonk.com)
- **Email**: bitdatax@gmail.com

---

**Built with ❤️ for ambitious learners**

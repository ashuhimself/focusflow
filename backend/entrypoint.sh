#!/bin/bash

# Exit on error
set -e

echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up and running!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell << END
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@focusflow.com', 'Darunpur@#2025')
    print('Superuser created: admin / Darunpur@#2025')
else:
    print('Superuser already exists')
END

# Execute the command passed to docker (gunicorn)
exec "$@"

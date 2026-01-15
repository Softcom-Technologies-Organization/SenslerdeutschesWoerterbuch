#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "--> Check database connection..."
# Simple python script to wait for the database
python << END
import sys
import time
import psycopg2
import os

# Loop until connection succeeds
for i in range(30):
    try:
        psycopg2.connect(
            dbname=os.environ.get('POSTGRES_NAME'),
            user=os.environ.get('POSTGRES_USER'),
            password=os.environ.get('POSTGRES_PASSWORD'),
            host=os.environ.get('POSTGRES_HOST'),
            port=os.environ.get('POSTGRES_PORT')
        )
        print("--> Database is ready!")
        sys.exit(0)
    except psycopg2.OperationalError:
        print(f"--> Database not ready yet... (Attempt {i+1}/30)")
        
        time.sleep(1)

sys.exit(1)
END

echo "--> Applying database migrations..."
python manage.py migrate --noinput

echo "--> Creating default superuser (if not exists)..."
# This python script creates a superuser only if one with that username doesn't exist
python << END
import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser: {username}")
    User.objects.create_superuser(username, email, password)
else:
    print(f"Superuser {username} already exists.")
END

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Starting Server..."
# Exec runs the command passed to the docker container (CMD in Dockerfile)
exec "$@"
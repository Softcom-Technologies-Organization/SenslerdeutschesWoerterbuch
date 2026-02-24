#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations
python manage.py migrate --noinput

# Create superuser if it doesn't exist
python << END
import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
END

# Execute the command passed as arguments to the entrypoint
exec "$@"
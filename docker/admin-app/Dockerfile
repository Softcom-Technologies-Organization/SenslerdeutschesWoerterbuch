FROM python:3.14-slim

WORKDIR /app

COPY ./admin-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./admin-app/ .
RUN python manage.py collectstatic --noinput --clear

COPY ./docker/admin-app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN useradd -m appuser && chown -R appuser /app
USER appuser
ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 8000
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000", "--access-logfile -"]
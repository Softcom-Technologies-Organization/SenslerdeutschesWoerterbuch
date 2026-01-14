FROM python:3.14-slim

WORKDIR /app

COPY ./admin-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./admin-app/ .

EXPOSE 8000
CMD ["gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000"]
FROM python:3.14-slim

WORKDIR /app

# Install dependencies
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy files into the container
COPY ./backend/main.py .
COPY ./backend/index.json .
COPY ./backend/bulk_data.ndjson .

# Port the application listens on
EXPOSE 8000

# Command to run the application using Uvicorn
# Use --host 0.0.0.0 to make it accessible outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

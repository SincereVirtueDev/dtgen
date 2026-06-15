FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (gcc for psycopg2, etc.)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# The application code will be mounted as a volume in development

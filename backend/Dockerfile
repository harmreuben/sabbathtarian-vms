# Use official Python lightweight image
FROM python:3.11-slim

# Set environment variables to prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies required for psycopg2 (PostgreSQL adapter)
RUN apt-get update \
    && apt-get install -y gcc python3-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project code
COPY . /app/

# Run gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
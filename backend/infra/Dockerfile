FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Python deps first (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Remove any stale pyc/pycache from host
RUN find /app -name "*.pyc" -delete && find /app -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

EXPOSE 8000

# Use reload for development; remove --reload for production
CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

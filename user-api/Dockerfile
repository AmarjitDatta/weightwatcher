FROM python:3.12-slim

WORKDIR /app

# Copy requirements file
COPY user-api/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared database module from root
COPY database.py .

# Copy application code
COPY user-api/main.py .

# Expose port 8001
EXPOSE 8001

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

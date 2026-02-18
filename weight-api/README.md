# Weight Tracking API

FastAPI REST API service for weight tracking with full CRUD operations. Part of the Weight Tracker Application microservices architecture.

## Overview

This service provides endpoints to manage weight records for users. It uses PostgreSQL for data persistence and supports operations like adding, retrieving, updating, and deleting weight records.

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL 15 (shared with User API)
- **Validation**: Pydantic
- **Server**: Uvicorn

## API Endpoints

### GET /weights

Get weight records for a specific user.

**Query Parameters:**
- `userId` (required): Integer - User ID to filter records

**Example Request:**
```bash
curl "http://localhost:8000/weights?userId=123"
```

**Response (200 OK):**
```json
[
  {
    "weightId": 1,
    "weight": 150.5,
    "userId": 123,
    "timestamp": "2026-02-18T10:30:45.123456"
  },
  {
    "weightId": 2,
    "weight": 149.2,
    "userId": 123,
    "timestamp": "2026-02-18T11:15:22.654321"
  }
]
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Bad Request: userId is required"
}
```

---

### POST /weights

Add a new weight record. The timestamp and weightId are automatically generated.

**Request Body:**
```json
{
  "weight": 150.5,
  "userId": 123
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/weights \
  -H "Content-Type: application/json" \
  -d '{"weight": 150.5, "userId": 123}'
```

**Response (200 OK):**
```json
{
  "weightId": 1,
  "weight": 150.5,
  "userId": 123,
  "timestamp": "2026-02-18T10:30:45.123456"
}
```

**Notes:**
- `weightId` is auto-generated per user (starts from 1 for each new user)
- `timestamp` is automatically set to current date/time

---

### PUT /weights

Update an existing weight record by userId and weightId.

**Query Parameters:**
- `userId` (required): Integer - User ID
- `weightId` (required): Integer - Weight ID for the user

**Request Body:**
```json
{
  "weight": 145.0
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:8000/weights?userId=123&weightId=1" \
  -H "Content-Type: application/json" \
  -d '{"weight": 145.0}'
```

**Response (200 OK):**
```json
{
  "weightId": 1,
  "weight": 145.0,
  "userId": 123,
  "timestamp": "2026-02-18T12:00:00.000000"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Weight record not found"
}
```

---

### DELETE /weights

Delete a weight record by userId and weightId.

**Query Parameters:**
- `userId` (required): Integer - User ID
- `weightId` (required): Integer - Weight ID for the user

**Example Request:**
```bash
curl -X DELETE "http://localhost:8000/weights?userId=123&weightId=1"
```

**Response (200 OK):**
```json
{
  "message": "Weight record deleted successfully",
  "userId": 123,
  "weightId": 1
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Weight record not found"
}
```

## Database Schema

**Table: weights**
- `id`: Primary key (auto-increment)
- `weightId`: Integer (auto-generated per user, indexed)
- `userId`: Integer (indexed)
- `weight`: Float (weight in LB)
- `timestamp`: DateTime (auto-generated)

**Important**: Each user has their own sequence of weightIds starting from 1. For example:
- User 123: weightIds 1, 2, 3...
- User 456: weightIds 1, 2, 3...

## Running Locally

### With Docker (Recommended)

From the project root:
```bash
docker-compose up -d weight-api
```

### Without Docker

1. Set up PostgreSQL database

2. Set environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/weightdb"
```

3. Install dependencies:
```bash
cd weight-api
pip install -r requirements.txt
```

4. Ensure `database.py` is available (it's in the project root)

5. Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Interactive API Documentation

Once the server is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Dependencies

See [requirements.txt](requirements.txt):
- fastapi==0.109.1
- uvicorn[standard]==0.27.0
- sqlalchemy==2.0.25
- psycopg2-binary==2.9.9
- python-dotenv==1.0.0

## CORS Configuration

The API is configured to allow cross-origin requests from any origin (`*`). In production, update the `allow_origins` list in `main.py` to specific domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://user:password@db:5432/weightdb`)

## Architecture

This service is part of a microservices architecture:
- **Port**: 8000
- **Container Name**: weight-api
- **Shared Database**: PostgreSQL (shared with user-api)
- **Dependencies**: Database must be healthy before starting

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: Successful operation
- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: Record not found
- `422 Unprocessable Entity`: Validation errors

## Testing

Example test sequence:

```bash
# Create a weight record
curl -X POST http://localhost:8000/weights \
  -H "Content-Type: application/json" \
  -d '{"weight": 150.5, "userId": 123}'

# Get all weights for user
curl "http://localhost:8000/weights?userId=123"

# Update a weight record
curl -X PUT "http://localhost:8000/weights?userId=123&weightId=1" \
  -H "Content-Type: application/json" \
  -d '{"weight": 148.0}'

# Delete a weight record
curl -X DELETE "http://localhost:8000/weights?userId=123&weightId=1"
```

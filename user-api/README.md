# User Management API

FastAPI REST API service for user management and authentication. Part of the Weight Tracker Application microservices architecture.

## Overview

This service provides endpoints to manage user accounts with secure password encryption. It uses PostgreSQL for data persistence and bcrypt for password hashing.

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0.25
- **Database**: PostgreSQL 15 (shared with Weight API)
- **Validation**: Pydantic with EmailStr
- **Password Hashing**: Passlib with bcrypt
- **Server**: Uvicorn

## API Endpoints

### POST /users

Create a new user with encrypted password.

**Request Body:**
```json
{
  "userId": 123,
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response (200 OK):**
```json
{
  "userId": 123,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Notes:**
- Password is hashed using bcrypt before storage
- Password is never returned in API responses
- Email must be in valid email format

**Error Responses:**

**400 Bad Request** - User ID already exists:
```json
{
  "detail": "User ID already exists"
}
```

**400 Bad Request** - Email already exists:
```json
{
  "detail": "Email already exists"
}
```

**422 Unprocessable Entity** - Validation error:
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "input": "invalid-email"
    }
  ]
}
```

---

### GET /users/{user_id}

Get user details by userId.

**Path Parameters:**
- `user_id`: Integer - User ID to retrieve

**Example Request:**
```bash
curl http://localhost:8001/users/123
```

**Response (200 OK):**
```json
{
  "userId": 123,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "User not found"
}
```

---

### GET /users

Get all users.

**Example Request:**
```bash
curl http://localhost:8001/users
```

**Response (200 OK):**
```json
[
  {
    "userId": 123,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  {
    "userId": 456,
    "fullName": "Jane Smith",
    "email": "jane@example.com"
  }
]
```

## Database Schema

**Table: users**
- `id`: Primary key (auto-increment)
- `userId`: Integer (unique, indexed, not null)
- `fullName`: String (255 chars, not null)
- `email`: String (255 chars, unique, indexed, not null)
- `password`: String (255 chars, not null) - Stores hashed password using bcrypt

**Constraints:**
- `userId` must be unique
- `email` must be unique and valid email format

## Security

### Password Hashing

Passwords are hashed using the bcrypt algorithm via Passlib:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash(plain_password)
```

**Security Features:**
- Bcrypt hashing with automatic salt generation
- Passwords are never stored or returned in plain text
- One-way hashing (cannot be reversed)

### Future Authentication

This API provides the foundation for authentication. Future enhancements may include:
- Login endpoint with password verification
- JWT token generation and validation
- Session management
- Password reset functionality

## Running Locally

### With Docker (Recommended)

From the project root:
```bash
docker-compose up -d user-api
```

### Without Docker

1. Set up PostgreSQL database

2. Set environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/weightdb"
```

3. Install dependencies:
```bash
cd user-api
pip install -r requirements.txt
```

4. Ensure `database.py` is available (it's in the project root)

5. Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Interactive API Documentation

Once the server is running:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## Dependencies

See [requirements.txt](requirements.txt):
- fastapi==0.109.1
- uvicorn[standard]==0.27.0
- sqlalchemy==2.0.25
- psycopg2-binary==2.9.9
- python-dotenv==1.0.0
- passlib[bcrypt]==1.7.4

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
- **Port**: 8001
- **Container Name**: user-api
- **Shared Database**: PostgreSQL (shared with weight-api)
- **Dependencies**: Database must be healthy before starting

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: Successful operation
- `400 Bad Request`: Duplicate userId or email
- `404 Not Found`: User not found
- `422 Unprocessable Entity`: Validation errors (invalid email, missing fields, etc.)

## Data Validation

Using Pydantic models for request validation:

**UserCreate:**
- `userId`: Integer (required)
- `fullName`: String (required)
- `email`: EmailStr (required, validated format)
- `password`: String (required)

**UserResponse:**
- `userId`: Integer
- `fullName`: String
- `email`: EmailStr

Passwords are excluded from response models for security.

## Testing

Example test sequence:

```bash
# Create a new user
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Get user by ID
curl http://localhost:8001/users/123

# Get all users
curl http://localhost:8001/users

# Test duplicate userId (should fail)
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "fullName": "Another User",
    "email": "another@example.com",
    "password": "password"
  }'

# Test duplicate email (should fail)
curl -X POST http://localhost:8001/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 456,
    "fullName": "Another User",
    "email": "john@example.com",
    "password": "password"
  }'
```

## Troubleshooting

**User ID or email already exists:**
- Check existing users: `curl http://localhost:8001/users`
- Use unique userId and email for each user

**Invalid email format:**
- Ensure email follows standard format (e.g., `user@domain.com`)
- Pydantic's EmailStr validates the format automatically

**Database connection errors:**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running and accessible
- Check database logs: `docker-compose logs db`

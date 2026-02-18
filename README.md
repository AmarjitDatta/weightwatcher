# Weight Tracker Application

A full-stack weight tracking application with a FastAPI backend, PostgreSQL database, and React frontend.

## Tech Stack

- **Frontend**: React 18, Axios, CSS3
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL 15
- **Deployment**: Docker, Docker Compose, Nginx

## Features

- **Frontend**: React-based UI for managing weight records
- **Backend**: FastAPI REST API with full CRUD operations
- **Database**: PostgreSQL for persistent data storage
- **Containerized**: All components run in Docker containers

## Quick Start

```bash
# Clone the repository
git clone https://github.com/AmarjitDatta/weightwatcher.git
cd weightwatcher

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

## Running with Docker Compose (Recommended)

This will run the FastAPI application, PostgreSQL database, and React frontend in separate containers.

1. Start all containers:
```bash
docker-compose up -d
```

2. Check if containers are running:
```bash
docker-compose ps
```

3. View logs:
```bash
docker-compose logs -f
```

4. Stop containers:
```bash
docker-compose down
```

5. Stop and remove all data (including database):
```bash
docker-compose down -v
```

**Access the application:**
- **Frontend UI**: `http://localhost:3000`
- **API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

## Running Locally (Without Docker)

### Backend

1. Install and start PostgreSQL locally

2. Set the DATABASE_URL environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/weightdb"
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set the API URL (optional - defaults to localhost:8000):
```bash
export REACT_APP_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### GET /weights
Get weight records for a specific user from the PostgreSQL database.

**Query Parameters:**
- `userId` (required): Integer - User ID to filter records

**Example Request:**
```
GET http://localhost:8000/weights?userId=123
```

**Response:**
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

**Error Response (missing userId):**
```json
{
  "detail": "Bad Request: userId is required"
}
```
Status Code: 400

### POST /weights
Add a new weight record to the PostgreSQL database. The timestamp and weightId are automatically generated per user.

**Request Body:**
```json
{
  "weight": 150.5,
  "userId": 123
}
```

**Response:**
```json
{
  "weightId": 1,
  "weight": 150.5,
  "userId": 123,
  "timestamp": "2026-02-18T10:30:45.123456"
}
```

### PUT /weights
Update an existing weight record by userId and weightId. The timestamp is automatically updated.

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
```
PUT http://localhost:8000/weights?userId=123&weightId=1
```

**Response:**
```json
{
  "weightId": 1,
  "weight": 145.0,
  "userId": 123,
  "timestamp": "2026-02-18T12:00:00.000000"
}
```

**Error Response (record not found):**
```json
{
  "detail": "Weight record not found"
}
```
Status Code: 404

### DELETE /weights
Delete a weight record by userId and weightId.

**Query Parameters:**
- `userId` (required): Integer - User ID
- `weightId` (required): Integer - Weight ID for the user

**Example Request:**
```
DELETE http://localhost:8000/weights?userId=123&weightId=1
```

**Response:**
```json
{
  "message": "Weight record deleted successfully",
  "userId": 123,
  "weightId": 1
}
```

**Error Response (record not found):**
```json
{
  "detail": "Weight record not found"
}
```
Status Code: 404

## Architecture

- **Frontend Container**: React application running on port 3000 (Nginx)
- **App Container**: FastAPI application running on port 8000
- **Database Container**: PostgreSQL 15 running on port 5432
- **Data Persistence**: PostgreSQL data is stored in a Docker volume

## Frontend UI

The React frontend provides an intuitive interface to interact with the API:

**Features:**
- **View Records**: Enter a User ID to load and display all weight records in a table
- **Add Weight**: Form to add new weight entries for any user
- **Update Weight**: Form to update existing weight records by userId and weightId
- **Delete Record**: Select a row from the table and delete it with confirmation

The frontend automatically communicates with the backend API and provides real-time feedback for all operations.

## Database Schema

**Table: weights**
- `id`: Primary key (auto-increment)
- `weightId`: Integer (auto-generated per user, indexed)
- `userId`: Integer (indexed)
- `weight`: Float (weight in LB)
- `timestamp`: DateTime (auto-generated)

**Note**: Each user has their own sequence of weightIds starting from 1. For example, User 123 might have weightIds 1, 2, 3, while User 456 also has weightIds 1, 2, 3.

## Interactive API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

**Frontend can't connect to API:**
- Ensure all containers are running: `docker-compose ps`
- Check API logs: `docker-compose logs app`
- Verify CORS is enabled in `main.py`

**Database connection errors:**
- Ensure database container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Restart all services: `docker-compose restart`

**Port already in use:**
- Stop existing containers: `docker-compose down`
- Check for processes using ports 3000, 8000, or 5432
- Modify port mappings in `docker-compose.yml` if needed

**Build errors:**
- Clear Docker cache: `docker-compose build --no-cache`
- Remove old images: `docker system prune -a`

## Development

To rebuild and restart after code changes:
```bash
docker-compose up -d --build
```

To view real-time logs:
```bash
docker-compose logs -f
```

## Repository

GitHub: https://github.com/AmarjitDatta/weightwatcher

# Names API

A simple REST API built with FastAPI to manage a list of names.

## Running with Docker (Recommended)

1. Build the Docker image:
```bash
docker build -t names-api .
```

2. Run the container:
```bash
docker run -p 8000:8000 names-api
```

The API will be available at `http://localhost:8000`

## Running Locally (Without Docker)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

# Weight Tracking API

A simple REST API built with FastAPI to track weight data with timestamps, using PostgreSQL database.

## Running with Docker Compose (Recommended)

This will run both the FastAPI application and PostgreSQL database in separate containers.

1. Start both containers:
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

The API will be available at `http://localhost:8000`

## Running Locally (Without Docker)

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

## API Endpoints

### GET /weights
Get all weight records from the PostgreSQL database.

**Response:**
```json
[
  {
    "weight": 150.5,
    "userId": 123,
    "timestamp": "2026-02-18T10:30:45.123456"
  },
  {
    "weight": 149.2,
    "userId": 123,
    "timestamp": "2026-02-18T11:15:22.654321"
  }
]
```

### POST /weights
Add a new weight record to the PostgreSQL database. The timestamp is automatically generated.

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
  "weight": 150.5,
  "userId": 123,
  "timestamp": "2026-02-18T10:30:45.123456"
}
```

## Architecture

- **App Container**: FastAPI application running on port 8000
- **Database Container**: PostgreSQL 15 running on port 5432
- **Data Persistence**: PostgreSQL data is stored in a Docker volume

## Database Schema

**Table: weights**
- `id`: Primary key (auto-increment)
- `userId`: Integer (indexed)
- `weight`: Float (weight in LB)
- `timestamp`: DateTime (auto-generated)

## Interactive API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

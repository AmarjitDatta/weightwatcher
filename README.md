# Weight Tracker Application

A full-stack weight tracking application built with microservices architecture, featuring separate FastAPI services for weight tracking and user management, PostgreSQL database, and a React frontend.

## Architecture

This application follows a **microservices architecture** with the following components:

```
┌─────────────────┐
│  React Frontend │  (Port 3000)
│     (Nginx)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──────┐ ┌▼────────────┐
│ Weight   │ │   User      │
│   API    │ │    API      │
│ (Port    │ │  (Port      │
│  8000)   │ │   8001)     │
└────┬─────┘ └─────┬───────┘
     │             │
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │ PostgreSQL  │  (Port 5432)
     │  Database   │
     └─────────────┘
```

## Components

- **[Weight API](weight-api/)** - REST API for weight tracking (CRUD operations)
- **[User API](user-api/)** - REST API for user management and authentication
- **[Frontend](frontend/)** - React SPA with authentication and weight tracking UI
- **Database** - PostgreSQL 15 (shared by both APIs)

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Chart.js, CSS3, Nginx
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL 15
- **Security**: Passlib with Bcrypt (password hashing)
- **Deployment**: Docker, Docker Compose

## Features

- ✅ **User Authentication** - Secure login/register system with encrypted passwords
- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **Weight Tracking** - Full CRUD operations for weight records per user
- ✅ **Visual Analytics** - Interactive time series line chart showing weight progress
- ✅ **User Management** - Auto-generated user IDs with bcrypt password hashing
- ✅ **React UI** - Modern single-page application with routing
- ✅ **Session Persistence** - Users stay logged in via localStorage
- ✅ **Data Persistence** - PostgreSQL database with proper schema
- ✅ **Dockerized** - All services run in containers
- ✅ **API Documentation** - Auto-generated Swagger/ReDoc documentation
- ✅ **Protected Routes** - Weight tracker accessible only after login

## Quick Start

```bash
# Clone the repository
git clone https://github.com/AmarjitDatta/weightwatcher.git
cd weightwatcher

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Weight API Docs: http://localhost:8000/docs
# User API Docs: http://localhost:8001/docs
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
- **Weight API**: `http://localhost:8000`
- **Weight API Documentation**: `http://localhost:8000/docs`
- **User API**: `http://localhost:8001`
- **User API Documentation**: `http://localhost:8001/docs`

## Service Documentation

Each microservice has its own detailed documentation:

- **[Weight API Documentation](weight-api/README.md)** - Weight tracking endpoints, database schema, testing
- **[User API Documentation](user-api/README.md)** - User management endpoints, security, authentication

## User Flow

1. **Register** - New users create an account with full name, email, and password
   - userId is auto-generated (starts at 1000)
   - Password is encrypted with bcrypt before storage
   - Success message shown, then redirected to login

2. **Login** - Users authenticate with email and password
   - Credentials verified against database
   - User info stored in browser localStorage
   - Automatically redirected to weight tracker

3. **Weight Tracker** - Logged-in users can:
   - View all their weight entries in a table
   - Add new weight entries
   - Edit existing entries inline
   - Delete entries with confirmation
   - All operations use the logged-in userId automatically

4. **Logout** - Clears session and returns to login page

## API Overview

### Weight Tracking API (Port 8000)

Manages weight records with full CRUD operations:
- `GET /weights?userId={id}` - Get all weight records for a user
- `POST /weights` - Add new weight record
- `PUT /weights?userId={id}&weightId={id}` - Update weight record
- `DELETE /weights?userId={id}&weightId={id}` - Delete weight record

📖 **[Full Weight API Documentation →](weight-api/README.md)**

### User Management API (Port 8001)

Handles user registration and authentication:
- `POST /users` - Register new user (auto-generates userId)
- `POST /login` - Authenticate user with email/password
- `GET /users/{user_id}` - Get user by ID
- `GET /users` - Get all users

📖 **[Full User API Documentation →](user-api/README.md)**

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

3. Set the API URLs (optional - defaults shown):
```bash
export REACT_APP_API_URL=http://localhost:8000
export REACT_APP_USER_API_URL=http://localhost:8001
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Frontend UI

The React frontend is a modern single-page application with authentication:

**Pages:**
- **Login Page** (`/login`) - Email and password authentication
- **Register Page** (`/register`) - New user registration with validation
- **Weight Tracker** (`/tracker`) - Protected route for logged-in users only

**Features:**
- **Authentication Flow** - Complete login/register system with session management
- **Protected Routes** - Automatic redirect to login if not authenticated
- **Session Persistence** - Users stay logged in across browser sessions
- **User-Specific Data** - Each user only sees their own weight entries
- **Inline Editing** - Edit weight entries directly in the table
- **Real-time Feedback** - Success and error messages for all operations
- **Responsive Design** - Works on desktop and mobile devices

## Database Schema

**Table: users**
- `id`: Primary key (auto-increment)
- `userId`: Integer (unique, indexed, not null)
- `fullName`: String (255 chars, not null)
- `email`: String (255 chars, unique, indexed, not null)
- `password`: String (255 chars, not null) - Stores hashed password using bcrypt

**Table: weights**
- `id`: Primary key (auto-increment)
- `weightId`: Integer (auto-generated per user, indexed)
- `userId`: Integer (indexed)
- `weight`: Float (weight in LB)
- `timestamp`: DateTime (auto-generated)

**Note**: Each user has their own sequence of weightIds starting from 1. For example, User 123 might have weightIds 1, 2, 3, while User 456 also has weightIds 1, 2, 3.

## Interactive API Documentation

Once the servers are running, you can access:

**Weight Tracking API:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**User Management API:**
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Troubleshooting

**Frontend can't connect to API:**
- Ensure all containers are running: `docker-compose ps`
- Check Weight API logs: `docker-compose logs weight-api`
- Check User API logs: `docker-compose logs user-api`
- Verify CORS is enabled in both API `main.py` files

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

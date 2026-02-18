from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import UserDB, get_db

app = FastAPI(title="User Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Pydantic models
class UserCreate(BaseModel):
    userId: int
    fullName: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    userId: int
    fullName: str
    email: str
    
    class Config:
        from_attributes = True


class UserCreateResponse(BaseModel):
    userId: int


# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "user-management-api"}


@app.post("/users", response_model=UserCreateResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user with encrypted password"""
    # Check if userId already exists
    existing_user_id = db.query(UserDB).filter(UserDB.userId == user.userId).first()
    if existing_user_id:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    # Check if email already exists
    existing_email = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user with hashed password
    hashed_password = hash_password(user.password)
    new_user = UserDB(
        userId=user.userId,
        fullName=user.fullName,
        email=user.email,
        password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"userId": new_user.userId}


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by userId"""
    user = db.query(UserDB).filter(UserDB.userId == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@app.get("/users", response_model=list[UserResponse])
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(UserDB).all()
    return users

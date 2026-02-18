from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import WeightDB, get_db

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration (must match user-api)
SECRET_KEY = "your-secret-key-change-in-production-use-env-variable"
ALGORITHM = "HS256"

# Security
security = HTTPBearer()


# Helper functions
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user_id"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Pydantic models
class WeightInput(BaseModel):
    weight: float
    userId: int


class WeightRecord(BaseModel):
    weightId: int
    weight: float
    userId: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class WeightUpdate(BaseModel):
    weight: float


# API Endpoints
@app.get("/weights", response_model=List[WeightRecord])
async def get_weights(userId: Optional[int] = None, db: Session = Depends(get_db), current_user_id: int = Depends(verify_token)):
    """Get weight records for a specific user (requires authentication)"""
    if userId is None:
        raise HTTPException(status_code=400, detail="Bad Request: userId is required")
    
    # Ensure users can only access their own data
    if userId != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access other users' data")
    
    weights = db.query(WeightDB).filter(WeightDB.userId == userId).all()
    return weights


@app.post("/weights", response_model=WeightRecord)
async def add_weight(data: WeightInput, db: Session = Depends(get_db), current_user_id: int = Depends(verify_token)):
    """Add a new weight record to the database (requires authentication)"""
    # Ensure users can only add data for themselves
    if data.userId != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot add data for other users")
    
    # Get the max weightId for this user and increment
    max_weight = db.query(WeightDB).filter(WeightDB.userId == data.userId).order_by(WeightDB.weightId.desc()).first()
    next_weight_id = 1 if max_weight is None else max_weight.weightId + 1
    
    weight_record = WeightDB(
        weightId=next_weight_id,
        weight=data.weight,
        userId=data.userId,
        timestamp=datetime.now()
    )
    db.add(weight_record)
    db.commit()
    db.refresh(weight_record)
    return weight_record


@app.put("/weights", response_model=WeightRecord)
async def update_weight(userId: int, weightId: int, data: WeightUpdate, db: Session = Depends(get_db), current_user_id: int = Depends(verify_token)):
    """Update an existing weight record (requires authentication)"""
    # Ensure users can only update their own data
    if userId != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot update other users' data")
    
    weight_record = db.query(WeightDB).filter(
        WeightDB.userId == userId,
        WeightDB.weightId == weightId
    ).first()
    
    if not weight_record:
        raise HTTPException(status_code=404, detail="Weight record not found")
    
    weight_record.weight = data.weight
    weight_record.timestamp = datetime.now()
    
    db.commit()
    db.refresh(weight_record)
    return weight_record


@app.delete("/weights")
async def delete_weight(userId: int, weightId: int, db: Session = Depends(get_db), current_user_id: int = Depends(verify_token)):
    """Delete a weight record (requires authentication)"""
    # Ensure users can only delete their own data
    if userId != current_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot delete other users' data")
    
    weight_record = db.query(WeightDB).filter(
        WeightDB.userId == userId,
        WeightDB.weightId == weightId
    ).first()
    
    if not weight_record:
        raise HTTPException(status_code=404, detail="Weight record not found")
    
    db.delete(weight_record)
    db.commit()
    
    return {"message": "Weight record deleted successfully", "userId": userId, "weightId": weightId}

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
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
async def get_weights(userId: Optional[int] = None, db: Session = Depends(get_db)):
    """Get weight records for a specific user"""
    if userId is None:
        raise HTTPException(status_code=400, detail="Bad Request: userId is required")
    
    weights = db.query(WeightDB).filter(WeightDB.userId == userId).all()
    return weights


@app.post("/weights", response_model=WeightRecord)
async def add_weight(data: WeightInput, db: Session = Depends(get_db)):
    """Add a new weight record to the database with auto-generated timestamp and weightId"""
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
async def update_weight(userId: int, weightId: int, data: WeightUpdate, db: Session = Depends(get_db)):
    """Update an existing weight record by userId and weightId"""
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
async def delete_weight(userId: int, weightId: int, db: Session = Depends(get_db)):
    """Delete a weight record by userId and weightId"""
    weight_record = db.query(WeightDB).filter(
        WeightDB.userId == userId,
        WeightDB.weightId == weightId
    ).first()
    
    if not weight_record:
        raise HTTPException(status_code=404, detail="Weight record not found")
    
    db.delete(weight_record)
    db.commit()
    
    return {"message": "Weight record deleted successfully", "userId": userId, "weightId": weightId}

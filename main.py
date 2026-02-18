from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from database import WeightDB, get_db

app = FastAPI()


# Pydantic models
class WeightInput(BaseModel):
    weight: float
    userId: int


class WeightRecord(BaseModel):
    weight: float
    userId: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


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
    """Add a new weight record to the database with auto-generated timestamp"""
    weight_record = WeightDB(
        weight=data.weight,
        userId=data.userId,
        timestamp=datetime.now()
    )
    db.add(weight_record)
    db.commit()
    db.refresh(weight_record)
    return weight_record

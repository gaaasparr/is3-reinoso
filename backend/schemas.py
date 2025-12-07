import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from models import Frequency, Status


class HabitCreate(BaseModel):
    title: str = Field(..., max_length=150)
    description: Optional[str] = None
    frequency: Frequency
    status: Status = Status.active
    history_count: int = Field(0, ge=0)


class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    frequency: Optional[Frequency] = None
    status: Optional[Status] = None
    history_count: Optional[int] = Field(None, ge=0)


class HabitResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    frequency: Frequency
    status: Status
    history_count: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True

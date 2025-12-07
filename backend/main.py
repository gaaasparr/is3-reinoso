import os
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, Sequence

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import DateTime, Enum as SAEnum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


def _build_db_url() -> str:
    direct_uri = os.getenv("POSTGRESQL_ADDON_URI")
    if direct_uri:
        return direct_uri.replace("postgresql://", "postgresql+asyncpg://")

    host = os.getenv("POSTGRESQL_ADDON_HOST", "localhost")
    user = os.getenv("POSTGRESQL_ADDON_USER", "postgres")
    password = os.getenv("POSTGRESQL_ADDON_PASSWORD", "postgres")
    port = os.getenv("POSTGRESQL_ADDON_PORT", "5432")
    db = os.getenv("POSTGRESQL_ADDON_DB", "postgres")
    return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}"


DATABASE_URL = _build_db_url()


class Base(DeclarativeBase):
    pass


class Frequency(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class Status(str, Enum):
    active = "active"
    paused = "paused"
    archived = "archived"


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    frequency: Mapped[Frequency] = mapped_column(
        SAEnum(Frequency, name="frequency_enum"), nullable=False
    )
    status: Mapped[Status] = mapped_column(
        SAEnum(Status, name="status_enum"), nullable=False, default=Status.active
    )
    history_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)

app = FastAPI(title="Habit Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


async def get_habit_or_404(session: AsyncSession, habit_id: uuid.UUID) -> Habit:
    habit = await session.get(Habit, habit_id)
    if habit is None or habit.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def read_root():
    return {"message": "Habit Tracker API running"}


@app.get("/habits", response_model=list[HabitResponse])
async def list_habits() -> Sequence[Habit]:
    async with async_session() as session:
        result = await session.execute(
            Habit.__table__.select().where(Habit.deleted_at.is_(None))
        )
        return result.scalars().all()


@app.get("/habits/{habit_id}", response_model=HabitResponse)
async def get_habit(habit_id: uuid.UUID) -> Habit:
    async with async_session() as session:
        habit = await get_habit_or_404(session, habit_id)
        return habit


@app.post("/habits", response_model=HabitResponse, status_code=201)
async def create_habit(payload: HabitCreate) -> Habit:
    habit = Habit(
        title=payload.title,
        description=payload.description,
        frequency=payload.frequency,
        status=payload.status,
        history_count=payload.history_count,
    )
    async with async_session() as session:
        session.add(habit)
        await session.commit()
        await session.refresh(habit)
        return habit


@app.patch("/habits/{habit_id}", response_model=HabitResponse)
async def update_habit(habit_id: uuid.UUID, payload: HabitUpdate) -> Habit:
    async with async_session() as session:
        habit = await get_habit_or_404(session, habit_id)
        data = payload.dict(exclude_unset=True)
        for key, value in data.items():
            setattr(habit, key, value)
        habit.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(habit)
        return habit


@app.post("/habits/{habit_id}/complete", response_model=HabitResponse)
async def mark_completed(habit_id: uuid.UUID) -> Habit:
    async with async_session() as session:
        habit = await get_habit_or_404(session, habit_id)
        habit.history_count += 1
        habit.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(habit)
        return habit


@app.delete("/habits/{habit_id}", status_code=204)
async def delete_habit(habit_id: uuid.UUID) -> None:
    async with async_session() as session:
        habit = await get_habit_or_404(session, habit_id)
        habit.deleted_at = datetime.utcnow()
        await session.commit()

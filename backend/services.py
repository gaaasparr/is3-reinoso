import uuid
from datetime import datetime
from typing import Sequence

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Habit
from schemas import HabitCreate, HabitUpdate


async def get_habit_or_404(session: AsyncSession, habit_id: uuid.UUID) -> Habit:
    habit = await session.get(Habit, habit_id)
    if habit is None or habit.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


async def list_habits(session: AsyncSession) -> Sequence[Habit]:
    result = await session.execute(
        select(Habit).where(Habit.deleted_at.is_(None)).order_by(Habit.created_at.desc())
    )
    return result.scalars().all()


async def create_habit(session: AsyncSession, payload: HabitCreate) -> Habit:
    habit = Habit(
        title=payload.title,
        description=payload.description,
        frequency=payload.frequency,
        status=payload.status,
        history_count=payload.history_count,
    )
    session.add(habit)
    await session.commit()
    await session.refresh(habit)
    return habit


async def update_habit(
    session: AsyncSession, habit_id: uuid.UUID, payload: HabitUpdate
) -> Habit:
    habit = await get_habit_or_404(session, habit_id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(habit, key, value)
    habit.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(habit)
    return habit


async def complete_habit(session: AsyncSession, habit_id: uuid.UUID) -> Habit:
    habit = await get_habit_or_404(session, habit_id)
    habit.history_count += 1
    habit.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(habit)
    return habit


async def delete_habit(session: AsyncSession, habit_id: uuid.UUID) -> None:
    habit = await get_habit_or_404(session, habit_id)
    habit.deleted_at = datetime.utcnow()
    await session.commit()

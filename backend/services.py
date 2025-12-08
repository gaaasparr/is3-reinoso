import uuid
from datetime import date, datetime
from typing import Sequence

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Habit, HabitDailyProgress
from schemas import HabitCreate, HabitUpdate


async def get_habit_or_404(session: AsyncSession, habit_id: uuid.UUID) -> Habit:
    habit = await session.get(Habit, habit_id)
    if habit is None or habit.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


async def list_habits(session: AsyncSession) -> Sequence[Habit]:
    habits_result = await session.execute(
        select(Habit).where(Habit.deleted_at.is_(None)).order_by(Habit.created_at.desc())
    )
    habits = habits_result.scalars().all()

    today = date.today()
    progress_result = await session.execute(
        select(HabitDailyProgress.habit_id, HabitDailyProgress.count).where(
            HabitDailyProgress.day == today
        )
    )
    progress_map = {row.habit_id: row.count for row in progress_result.all()}

    for h in habits:
        setattr(h, "today_completions", progress_map.get(h.id, 0))
    return habits


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

    today = date.today()
    progress_result = await session.execute(
        select(HabitDailyProgress).where(
            HabitDailyProgress.habit_id == habit_id, HabitDailyProgress.day == today
        )
    )
    progress = progress_result.scalars().first()
    if progress:
        progress.count += 1
    else:
        progress = HabitDailyProgress(habit_id=habit_id, day=today, count=1)
        session.add(progress)

    await session.commit()
    await session.refresh(habit)
    setattr(habit, "today_completions", progress.count)
    return habit


async def delete_habit(session: AsyncSession, habit_id: uuid.UUID) -> None:
    habit = await get_habit_or_404(session, habit_id)
    habit.deleted_at = datetime.utcnow()
    await session.commit()

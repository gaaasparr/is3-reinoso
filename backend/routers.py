import uuid
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_session
from schemas import HabitCreate, HabitResponse, HabitUpdate
from services import complete_habit, create_habit, delete_habit, get_habit_or_404, list_habits, update_habit
from models import HabitDailyProgress


router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("", response_model=list[HabitResponse])
async def list_habits_route(
    session: AsyncSession = Depends(get_session),
) -> list[HabitResponse]:
    return await list_habits(session)


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit_route(
    habit_id: uuid.UUID, session: AsyncSession = Depends(get_session)
) -> HabitResponse:
    habit = await get_habit_or_404(session, habit_id)
    # Attach today's completions for detail view
    today_count = await session.execute(
        select(HabitDailyProgress.count).where(
            HabitDailyProgress.habit_id == habit_id, HabitDailyProgress.day == date.today()
        )
    )
    row = today_count.first()
    setattr(habit, "today_completions", row[0] if row else 0)
    return habit


@router.post("", response_model=HabitResponse, status_code=201)
async def create_habit_route(
    payload: HabitCreate, session: AsyncSession = Depends(get_session)
) -> HabitResponse:
    return await create_habit(session, payload)


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit_route(
    habit_id: uuid.UUID, payload: HabitUpdate, session: AsyncSession = Depends(get_session)
) -> HabitResponse:
    return await update_habit(session, habit_id, payload)


@router.post("/{habit_id}/complete", response_model=HabitResponse)
async def complete_habit_route(
    habit_id: uuid.UUID, session: AsyncSession = Depends(get_session)
) -> HabitResponse:
    return await complete_habit(session, habit_id)


@router.delete("/{habit_id}", status_code=204)
async def delete_habit_route(
    habit_id: uuid.UUID, session: AsyncSession = Depends(get_session)
) -> None:
    await delete_habit(session, habit_id)

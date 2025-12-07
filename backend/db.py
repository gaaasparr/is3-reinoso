import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


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

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

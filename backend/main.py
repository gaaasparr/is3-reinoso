from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import engine
from models import Base
from routers import router as habits_router


app = FastAPI(
    title="Habit Tracker API",
    description="API para gestionar hábitos (creación, actualización, completado y borrado).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def read_root():
    return {"message": "Habit Tracker API running"}


app.include_router(habits_router)

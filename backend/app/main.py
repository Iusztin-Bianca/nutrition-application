import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.database import engine
from .core.exceptions import AppException
from .data import models  # noqa: F401
from .api.routes import health, auth, user_details, foods
from alembic.config import Config
from alembic import command


logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    
    ini_path = Path("alembic.ini")
    if not ini_path.exists():
        ini_path = Path(__file__).parent.parent / "alembic.ini"

    alembic_cfg = Config(str(ini_path))
    command.upgrade(alembic_cfg, "head")
    logger.info("Alembic migrations applied")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.to_thread(_run_migrations)
    yield
    await engine.dispose()


app = FastAPI(title="Nutrition API", version="0.1.0", lifespan=lifespan)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


# Must be defined BEFORE app.add_middleware(CORSMiddleware) so it ends up
# inside CORS in the stack — ensures 500 responses also carry CORS headers
@app.middleware("http")
async def handle_server_error(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": "A apărut o eroare internă."})


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://192.168.101.13:3000",
        "https://nutrition-application.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(user_details.router)
app.include_router(foods.router)

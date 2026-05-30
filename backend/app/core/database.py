from collections.abc import AsyncIterator
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from .config import settings


def _build_engine_url(url: str) -> str:
    parsed = urlparse(url)
    params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
    params.pop("channel_binding", None)
    params.pop("sslmode", None)
    clean = urlunparse(parsed._replace(query=urlencode(params)))
    # asyncpg needs ssl=require instead of sslmode=require
    if "neon.tech" in url and "ssl=" not in clean:
        clean += ("&" if "?" in clean else "?") + "ssl=require"
    return clean


engine = create_async_engine(
    _build_engine_url(settings.database_url),
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session

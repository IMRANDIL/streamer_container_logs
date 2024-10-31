from fastapi import FastAPI
import aioredis
import asyncpg
import os
import json
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = await asyncpg.connect(DATABASE_URL)
    yield
    await app.state.db.close()

app = FastAPI(lifespan=lifespan)
redis = aioredis.from_url("redis://redis:6379")
DATABASE_URL = "postgresql://user:password@postgres:5432/logs_db"

async def publish_log(event: str):
    await redis.publish("logs", json.dumps({"service": "service3", "event": event, "timestamp": "now"}))

@app.get("/")
async def root():
    await publish_log("Root endpoint accessed")
    row = await app.state.db.fetchrow("SELECT NOW()")
    return {"message": "Service 3", "dbTime": row["now"]}

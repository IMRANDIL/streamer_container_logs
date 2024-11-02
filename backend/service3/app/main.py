from fastapi import FastAPI, HTTPException
import asyncpg
import os
import json
from contextlib import asynccontextmanager
from aiokafka import AIOKafkaProducer
import asyncio

DATABASE_URL = "postgresql://user:password@postgres:5432/logs_db"

async def connect_with_retries(db_url: str, retries: int = 5, delay: int = 2):
    for attempt in range(retries):
        try:
            connection = await asyncpg.connect(db_url)
            return connection
        except Exception as e:
            if attempt < retries - 1:
                await asyncio.sleep(delay)  # Wait before retrying
            else:
                raise e  # Raise exception if all retries fail

async def start_kafka_producer_with_retries(bootstrap_servers: str, retries: int = 5, delay: int = 2):
    producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)
    for attempt in range(retries):
        try:
            await producer.start()
            return producer
        except Exception as e:
            if attempt < retries - 1:
                await asyncio.sleep(delay)  # Wait before retrying
            else:
                raise e  # Raise exception if all retries fail

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = await connect_with_retries(DATABASE_URL)
    app.state.kafka_producer = await start_kafka_producer_with_retries('kafka:9092')
    yield
    await app.state.kafka_producer.stop()
    await app.state.db.close()

app = FastAPI(lifespan=lifespan)

async def publish_log(event: str):
    log_entry = json.dumps({"service": "service3", "event": event, "timestamp": "now"})
    await app.state.kafka_producer.send_and_wait("logTopic", log_entry.encode("utf-8"))

@app.get("/")
async def root():
    await publish_log("Root endpoint accessed")
    row = await app.state.db.fetchrow("SELECT NOW()")
    return {"message": "Service 3", "dbTime": row["now"]}

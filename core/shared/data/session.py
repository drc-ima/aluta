import uuid

from dotenv import load_dotenv
from fastapi import HTTPException
from sqlalchemy.orm import declarative_base, sessionmaker
from clients.db import postgres_engine
from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger

load_dotenv()

engine = postgres_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

logger.info("Database session setup complete.")

def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
        logger.info("Database session closed.")

def get_user() -> dict:
    try:
        user = get_user_id_email()
        if not user:
            raise HTTPException(status_code=401, detail="User is not authenticated")
        return user
    except Exception as e:
        logger.error(f"Session: Error fetching user {e}")
        raise e
        
from dotenv import load_dotenv
from sqlalchemy.orm import declarative_base, sessionmaker
from clients.db import postgres_engine
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
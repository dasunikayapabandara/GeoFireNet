import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.core.config import settings

DATABASE_URL = settings.database_url

# Create the SQLAlchemy engine
# pool_pre_ping=True helps detect disconnected databases early
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create a customized Session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative class definitions
Base = declarative_base()

# Dependency for FastAPI to get DB sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

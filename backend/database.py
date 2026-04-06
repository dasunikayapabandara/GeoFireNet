import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.core.config import settings

DATABASE_URL = settings.database_url

# Create the SQLAlchemy engine
# pool_pre_ping=True helps detect disconnected databases early
# pool_size and max_overflow prevent thread starvation without requiring async rewrites
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True,
    pool_size=10, 
    max_overflow=20
)

# Create a customized Session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative class definitions
Base = declarative_base()

# Note: Fast API route dependency get_db() is located in backend/api/deps.py

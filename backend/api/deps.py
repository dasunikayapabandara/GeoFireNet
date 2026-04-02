from backend.database import SessionLocal

# Dependency for FastAPI to get DB sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

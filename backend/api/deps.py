from backend.database import SessionLocal
from backend.services.prediction_service import RiskPredictor

_predictor_instance = RiskPredictor()

# Dependency for FastAPI to get DB sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_predictor():
    return _predictor_instance

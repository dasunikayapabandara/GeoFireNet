import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Location, WeatherInput, RiskPredictionLog, Alert, ModelVersion

# Setup in-memory SQLite specifically for rapid unit testing without touching the actual Postgres DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    # Create the tables in the test database
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_create_location(db_session):
    """Verify that basic inserts and PK generation work."""
    loc = Location(name="Test Loc", latitude=10.0, longitude=20.0)
    db_session.add(loc)
    db_session.commit()
    
    assert loc.id is not None
    assert loc.name == "Test Loc"

def test_prediction_creates_alert_relation(db_session):
    """Verify the foreign key relationships between weather, prediction, and alerts."""
    w_in = WeatherInput(temp=40.0, humidity=10.0, wind=50.0, veg_moisture=0.1)
    db_session.add(w_in)
    db_session.commit()
    
    pred = RiskPredictionLog(
        risk_score=95.0,
        risk_probability=0.95,
        risk_level="Extreme",
        baseline_score=90.0,
        system_status="TEST",
        weather_input_id=w_in.id
    )
    db_session.add(pred)
    db_session.commit()
    
    alert = Alert(prediction_id=pred.id, alert_level="Extreme", message="Test Alert")
    db_session.add(alert)
    db_session.commit()
    
    # Test strict SQLAlchemy relationship traversal
    assert pred.alert.message == "Test Alert"
    assert alert.prediction.risk_score == 95.0
    assert pred.weather_input.temp == 40.0

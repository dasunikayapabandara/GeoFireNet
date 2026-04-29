import os
import sys
from datetime import datetime, timedelta
import random

# Ensure root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.database import SessionLocal
from backend import models

def seed_database():
    db = SessionLocal()
    
    print("Clearing old demo data...")
    db.query(models.Alert).delete()
    db.query(models.RiskPredictionLog).delete()
    db.query(models.WeatherInput).delete()
    db.query(models.Location).delete()
    db.query(models.ModelVersion).delete()
    db.query(models.SystemLog).delete()
    db.commit()

    print("Inserting ModelVersion...")
    mv = models.ModelVersion(
        version_name="rf_pipeline_v2_calibrated",
        accuracy_metrics='{"roc_auc": 0.98, "recall": 0.995}',
        is_active=True
    )
    db.add(mv)
    
    print("Inserting Locations...")
    loc1 = models.Location(name="Napa Valley", latitude=38.5025, longitude=-122.2654)
    loc2 = models.Location(name="Lake Tahoe", latitude=39.0968, longitude=-120.0324)
    loc3 = models.Location(name="San Bernardino", latitude=34.1083, longitude=-117.2898)
    db.add_all([loc1, loc2, loc3])
    db.commit()

    print("Generating Historical Predictions & Alerts...")
    locations = [loc1, loc2, loc3]
    
    now = datetime.utcnow()
    # Generate 30 days of data
    for i in range(30):
        for loc in locations:
            # Randomize severity based on location (San Bernardino hotter/drier)
            base_temp = random.uniform(20, 35) + (5 if loc.name == "San Bernardino" else 0)
            base_hum = random.uniform(15, 60) - (10 if loc.name == "San Bernardino" else 0)
            
            w_input = models.WeatherInput(
                temp=base_temp,
                humidity=max(5, base_hum),
                wind=random.uniform(5, 60),
                veg_moisture=random.uniform(0.1, 0.8)
            )
            db.add(w_input)
            db.commit()
            
            # Heuristic for demo purposes
            risk_score = min(100, (w_input.temp * 1.5) + (w_input.wind * 0.5) + ((100-w_input.humidity) * 0.4))
            
            if risk_score > 85:
                level = "Extreme"
                prob = random.uniform(0.85, 0.99)
            elif risk_score > 70:
                level = "High"
                prob = random.uniform(0.55, 0.84)
            elif risk_score > 40:
                level = "Moderate"
                prob = random.uniform(0.2, 0.54)
            else:
                level = "Low"
                prob = random.uniform(0.01, 0.19)
                
            pred = models.RiskPredictionLog(
                timestamp=now - timedelta(days=30-i, hours=random.randint(0, 23)),
                risk_score=risk_score,
                risk_probability=prob,
                risk_level=level,
                baseline_score=risk_score * 0.9,
                system_status="PRODUCTION",
                primary_drivers="High Temperature, Low Humidity" if level in ["High", "Extreme"] else "None",
                location_id=loc.id,
                weather_input_id=w_input.id,
                model_version_id=mv.id
            )
            db.add(pred)
            db.commit()
            
            if level in ["High", "Extreme"]:
                alert = models.Alert(
                    triggered_at=pred.timestamp + timedelta(minutes=random.randint(1, 15)),
                    prediction_id=pred.id,
                    location_id=loc.id,
                    risk_score=risk_score,
                    severity=level.lower(),
                    alert_message=f"Automated {level} risk alert for {loc.name}. Please review conditions.",
                    key_drivers="High Temperature, Low Humidity" if level in ["High", "Extreme"] else None,
                    status="acknowledged" if random.choice([True, False]) else "active"
                )
                db.add(alert)
                
    db.commit()
    print("Database seeding completed securely with 90 predictions and related alerts.")

if __name__ == "__main__":
    seed_database()

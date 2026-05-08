"""add_integrity_constraints_and_indexes

Revision ID: b7c4e9a2f801
Revises: 80ca4d15641e
Create Date: 2026-05-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "b7c4e9a2f801"
down_revision: Union[str, Sequence[str], None] = "80ca4d15641e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint("ck_weather_temp_range", "weather_inputs", "temp >= -20 AND temp <= 60")
    op.create_check_constraint("ck_weather_humidity_range", "weather_inputs", "humidity >= 0 AND humidity <= 100")
    op.create_check_constraint("ck_weather_wind_range", "weather_inputs", "wind >= 0 AND wind <= 150")
    op.create_check_constraint("ck_weather_veg_moisture_range", "weather_inputs", "veg_moisture >= 0 AND veg_moisture <= 1")

    op.create_check_constraint("ck_prediction_risk_score_range", "risk_prediction_logs", "risk_score >= 0 AND risk_score <= 100")
    op.create_check_constraint("ck_prediction_risk_probability_range", "risk_prediction_logs", "risk_probability >= 0 AND risk_probability <= 1")
    op.create_check_constraint("ck_prediction_risk_level", "risk_prediction_logs", "risk_level IN ('Low', 'Moderate', 'High', 'Extreme')")
    op.create_check_constraint("ck_prediction_baseline_score_range", "risk_prediction_logs", "baseline_score >= 0 AND baseline_score <= 100")
    op.create_index("ix_prediction_level_timestamp", "risk_prediction_logs", ["risk_level", "timestamp"], unique=False)
    op.create_index("ix_prediction_location_timestamp", "risk_prediction_logs", ["location_id", "timestamp"], unique=False)

    op.create_check_constraint("ck_alert_risk_score_range", "alerts", "risk_score >= 0 AND risk_score <= 100")
    op.create_check_constraint("ck_alert_risk_level", "alerts", "risk_level IN ('Low', 'Moderate', 'High', 'Extreme')")
    op.create_check_constraint("ck_alert_severity", "alerts", "severity IN ('moderate', 'high', 'extreme')")
    op.create_check_constraint("ck_alert_status", "alerts", "status IN ('active', 'acknowledged', 'resolved')")
    op.create_index("ix_alert_status_severity_triggered", "alerts", ["status", "severity", "triggered_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alert_status_severity_triggered", table_name="alerts")
    op.drop_constraint("ck_alert_status", "alerts", type_="check")
    op.drop_constraint("ck_alert_severity", "alerts", type_="check")
    op.drop_constraint("ck_alert_risk_level", "alerts", type_="check")
    op.drop_constraint("ck_alert_risk_score_range", "alerts", type_="check")

    op.drop_index("ix_prediction_location_timestamp", table_name="risk_prediction_logs")
    op.drop_index("ix_prediction_level_timestamp", table_name="risk_prediction_logs")
    op.drop_constraint("ck_prediction_baseline_score_range", "risk_prediction_logs", type_="check")
    op.drop_constraint("ck_prediction_risk_level", "risk_prediction_logs", type_="check")
    op.drop_constraint("ck_prediction_risk_probability_range", "risk_prediction_logs", type_="check")
    op.drop_constraint("ck_prediction_risk_score_range", "risk_prediction_logs", type_="check")

    op.drop_constraint("ck_weather_veg_moisture_range", "weather_inputs", type_="check")
    op.drop_constraint("ck_weather_wind_range", "weather_inputs", type_="check")
    op.drop_constraint("ck_weather_humidity_range", "weather_inputs", type_="check")
    op.drop_constraint("ck_weather_temp_range", "weather_inputs", type_="check")

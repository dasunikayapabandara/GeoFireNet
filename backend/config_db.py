from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, AnyUrl, ConfigDict
import os

class Settings(BaseSettings):
    # Base configuration
    environment: str = "development"
    simulate_outage: bool = False

    # Database connection parameters
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "dasunika"
    db_password: str = "geofirenet_dev"
    db_name: str = "geofirenet_db"

    @property
    def database_url(self) -> str:
        # Build the postgresql://... url dynamically
        # Since pydantic-settings loads automatically from `.env`, you don't need manual logic here.
        # But we format it specifically for SQLAlchemy
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

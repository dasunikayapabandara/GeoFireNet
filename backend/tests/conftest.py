import os
import asyncio

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from backend.database import Base, engine, SessionLocal
from backend import models
import httpx
import fastapi.testclient


class DirectASGITestClient:
    __test__ = False
    _started_apps = set()

    def __init__(self, app):
        self.app = app
        app_id = id(app)
        if app_id not in self._started_apps:
            asyncio.run(app.router.startup())
            self._started_apps.add(app_id)

    def request(self, method: str, url: str, **kwargs):
        async def _send():
            transport = httpx.ASGITransport(app=self.app, raise_app_exceptions=True)
            async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
                return await client.request(method, url, **kwargs)

        return asyncio.run(_send())

    def get(self, url: str, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs):
        return self.request("POST", url, **kwargs)

    def patch(self, url: str, **kwargs):
        return self.request("PATCH", url, **kwargs)

    def delete(self, url: str, **kwargs):
        return self.request("DELETE", url, **kwargs)


fastapi.testclient.TestClient = DirectASGITestClient


def pytest_configure(config):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.ModelVersion).filter(models.ModelVersion.is_active == True).first():
            db.add(models.ModelVersion(
                version_name="rf_pipeline_test",
                accuracy_metrics='{"roc_auc": 0.9654, "recall": 0.8413}',
                is_active=True
            ))
            db.commit()
    finally:
        db.close()


def pytest_unconfigure(config):
    Base.metadata.drop_all(bind=engine)

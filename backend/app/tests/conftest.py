import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.config import settings

TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + "/farm_management_test"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """Registers and logs in a fresh ADMIN user, returns headers ready for authenticated requests."""
    register_resp = client.post("/api/v1/auth/register", json={
        "full_name": "Test Admin",
        "email": "test.admin@example.com",
        "password": "StrongPass123",
        "role": "ADMIN",
    })
    assert register_resp.status_code == 200, f"Register failed: {register_resp.status_code} {register_resp.text}"

    resp = client.post("/api/v1/auth/login", data={
        "username": "test.admin@example.com",
        "password": "StrongPass123",
    })
    assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def farm_and_store(client, auth_headers):
    """Creates a Farm + Store, returns their IDs — most modules need a store_id to create inventory."""
    farm_resp = client.post("/api/v1/farms", json={"name": "Test Farm"}, headers=auth_headers)
    farm_id = farm_resp.json()["id"]
    store_resp = client.post("/api/v1/stores", json={"farm_id": farm_id, "name": "Main Store"}, headers=auth_headers)
    store_id = store_resp.json()["id"]
    return {"farm_id": farm_id, "store_id": store_id}

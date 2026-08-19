from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login():
    resp = client.post("/api/v1/auth/register", json={
        "full_name": "Test Admin",
        "email": "test.admin@example.com",
        "password": "StrongPass123",
        "role": "ADMIN",
    })
    assert resp.status_code == 200

    resp = client.post("/api/v1/auth/login", data={
        "username": "test.admin@example.com",
        "password": "StrongPass123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()
